import { NextResponse } from "next/server";

import { UserCourseProgressCompleter } from "../../../../contexts/mooc/user_course_progress/application/complete/UserCourseProgressCompleter";
import { CourseSuggestionPrimitives } from "../../../../contexts/mooc/user_course_suggestions/domain/CourseSuggestion";
import { UserFinder } from "../../../../contexts/mooc/users/domain/UserFinder";
import { MySqlUserRepository } from "../../../../contexts/mooc/users/infrastructure/MySqlUserRepository";
import { MariaDBConnection } from "../../../../contexts/shared/infrastructure/MariaDBConnection";
import { container } from "../../../../contexts/shared/infrastructure/dependency-injection/diod.config";

const mariaDBConnection = new MariaDBConnection();

const mySqlUserRepository = new MySqlUserRepository(mariaDBConnection);
const userFinder = new UserFinder(mySqlUserRepository);

const completer = container.get(UserCourseProgressCompleter);

export async function POST(request: Request): Promise<NextResponse> {
	const { courseId, userId, courseName } = (await request.json()) as {
		courseId: string;
		userId: string;
		courseName: string;
	};

	await completer.complete(courseId, userId, courseName);

	const user = await userFinder.find(userId);

	const primitives = user.toPrimitives();

	return NextResponse.json({
		name: primitives.name,
		suggestedCourses: JSON.parse(primitives.suggestedCourses) as CourseSuggestionPrimitives[],
	});
}
