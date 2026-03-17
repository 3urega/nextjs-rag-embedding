import { randomUUID } from "crypto";

import { OllamaEmbeddings } from "@langchain/ollama";
import { Service } from "diod";

import { PostgresConnection } from "../../../shared/infrastructure/postgres/PostgresConnection";
import { Plan } from "../domain/Plan";
import { PlanId } from "../domain/PlanId";
import { PlanRepository } from "../domain/PlanRepository";
import { PlanSearchResult } from "../domain/PlanSearchResult";

type PlanRow = {
	id: string;
	title: string;
	description: string;
	location: string | null;
	url: string | null;
	tags: string[];
	children_friendly: boolean | null;
	vehicle_required: boolean | null;
	overnight_possible: boolean | null;
};

type SearchSimilarRow = PlanRow & { matched_chunk_content: string };

@Service()
export class PostgresPlanRepository implements PlanRepository {
	private readonly embeddings: OllamaEmbeddings;

	constructor(private readonly connection: PostgresConnection) {
		this.embeddings = new OllamaEmbeddings({
			model: "nomic-embed-text",
			baseUrl: "http://localhost:11434",
		});
	}

	async search(id: PlanId): Promise<Plan | null> {
		const rows = await this.connection.sql`
			SELECT id, title, description, location, url, tags,
				children_friendly, vehicle_required, overnight_possible
			FROM femturisme.plans
			WHERE id = ${id.value};
		`;

		return rows.length ? this.toPlan(rows[0] as PlanRow) : null;
	}

	async searchSimilar(query: string, limit = 5): Promise<PlanSearchResult[]> {
		const [vector] = await this.embeddings.embedDocuments([query]);

		const rows = await this.connection.sql<SearchSimilarRow[]>`
			SELECT
				p.id, p.title, p.description, p.location, p.url, p.tags,
				p.children_friendly, p.vehicle_required, p.overnight_possible,
				pc.content AS matched_chunk_content
			FROM femturisme.plan_chunks pc
			JOIN femturisme.plans p ON p.id = pc.plan_id
			WHERE pc.embedding IS NOT NULL
			ORDER BY pc.embedding <-> ${JSON.stringify(vector)}
			LIMIT ${limit};
		`;

		return rows.map((row) => ({
			plan: this.toPlan(row),
			matchedChunkContent: row.matched_chunk_content,
		}));
	}

	private toPlan(row: PlanRow): Plan {
		const tags = Array.isArray(row.tags) ? row.tags : (row.tags as unknown as string[]);
		return Plan.fromPrimitives({
			id: row.id,
			title: row.title,
			description: row.description,
			location: row.location,
			url: row.url,
			tags: tags ?? [],
			childrenFriendly: row.children_friendly,
			vehicleRequired: row.vehicle_required,
			overnightPossible: row.overnight_possible,
		});
	}
}
