import { ContainerBuilder } from "diod";

import { CoursesByIdsSearcher } from "../../../mooc/courses/application/search-by-ids/CoursesByIdsSearcher";
import { CourseRepository } from "../../../mooc/courses/domain/CourseRepository";
import { PostgresCourseRepository } from "../../../mooc/courses/infrastructure/PostgresCourseRepository";
import { NextSuggestedCoursesEmailSender } from "../../../mooc/next-suggested-courses-email/application/send-next-suggested-courses-email/NextSuggestedCoursesEmailSender";
import { NextSuggestedCoursesEmailRealSender } from "../../../mooc/next-suggested-courses-email/domain/NextSuggestedCoursesEmailRealSender";
import { ConsoleLogNextSuggestedCoursesEmailRealSender } from "../../../mooc/next-suggested-courses-email/infrastructure/ConsoleLogNextSuggestedCoursesEmailRealSender";
import { UserCourseProgressCompleter } from "../../../../contexts/mooc/user_course_progress/application/complete/UserCourseProgressCompleter";
import { GenerateUserCourseSuggestionsOnUserCourseProgressCompleted } from "../../../../contexts/mooc/user_course_suggestions/application/generate/GenerateUserCourseSuggestionsOnUserCourseProgressCompleted";
import { UserCourseSuggestionsGenerator } from "../../../../contexts/mooc/user_course_suggestions/application/generate/UserCourseSuggestionsGenerator";
import { OllamaMistralCourseSuggestionsGenerator } from "../../../../contexts/mooc/user_course_suggestions/infrastructure/OllamaMistralCourseSuggestionsGenerator";
import { MySqlUserCourseSuggestionsRepository } from "../../../../contexts/mooc/user_course_suggestions/infrastructure/MySqlUserCourseSuggestionsRepository";
import { UserFinder } from "../../../mooc/users/application/find/UserFinder";
import { UserRegistrar } from "../../../mooc/users/application/registrar/UserRegistrar";
import { EventBus } from "../../domain/event/EventBus";
import { InMemoryEventBus } from "../domain_event/InMemoryEventBus";
import { PostgresConnection } from "../postgres/PostgresConnection";
import { DomainUserFinder } from "../../../../contexts/mooc/users/domain/DomainUserFinder";
import {OllamaLlama31CourseSuggestionsGenerator} from "../../../../contexts/mooc/user_course_suggestions/infrastructure/OllamaLlama31CourseSuggestionsGenerator";
import { UpdateUserCourseSuggestionsOnUserCourseSuggestionsGenerated } from "../../../../contexts/mooc/users/application/update_course_suggestions/UpdateUserCourseSuggestionsOnUserCourseSuggestionsGenerated";
import { UserCourseSuggestionsUpdater } from "../../../../contexts/mooc/users/application/update_course_suggestions/UserCourseSuggestionsUpdater";
import { PostgresUserRepository } from "../../../../contexts/mooc/users/infrastructure/PostgresUserRepository";
import { CourseSuggestionsGenerator } from "../../../../contexts/mooc/user_course_suggestions/domain/CourseSuggestionsGenerator";
import { UserRepository } from "../../../../contexts/mooc/users/domain/UserRepository";
import { UserCourseSuggestionsRepository } from "../../../../contexts/mooc/user_course_suggestions/domain/UserCourseSuggestionsRepository";
import { PostgresUserCourseSuggestionsRepository } from "../../../../contexts/mooc/user_course_suggestions/infrastructure/PostgresUserCourseSuggestionsRepository";
const builder = new ContainerBuilder();

// Shared
builder
	.register(PostgresConnection)
	.useFactory(() => {
		return new PostgresConnection(
			"localhost",
			5432,
			"codely",
			"c0d3ly7v",
			"postgres",
		);
	})
	.asSingleton();

builder.register(EventBus).use(InMemoryEventBus);

// User
builder.register(UserRepository).use(PostgresUserRepository);
builder.registerAndUse(PostgresUserRepository);

builder.registerAndUse(UserRegistrar);

builder.registerAndUse(UserFinder);
builder.registerAndUse(DomainUserFinder);

builder
	.registerAndUse(UpdateUserCourseSuggestionsOnUserCourseSuggestionsGenerated)
	.addTag("subscriber");
builder.registerAndUse(UserCourseSuggestionsUpdater);

// UserCourseSuggestions
builder
	.register(CourseSuggestionsGenerator)
	.use(OllamaLlama31CourseSuggestionsGenerator);
builder
	.register(UserCourseSuggestionsRepository)
	.use(PostgresUserCourseSuggestionsRepository);
builder.registerAndUse(UserCourseSuggestionsGenerator);
builder
	.registerAndUse(GenerateUserCourseSuggestionsOnUserCourseProgressCompleted)
	.addTag("subscriber");

builder.registerAndUse(UserCourseProgressCompleter);

// Course
builder.register(CourseRepository).use(PostgresCourseRepository);
builder.registerAndUse(PostgresCourseRepository);
builder.registerAndUse(CoursesByIdsSearcher);

// NextSuggestedCoursesEmail
builder
	.register(NextSuggestedCoursesEmailRealSender)
	.use(ConsoleLogNextSuggestedCoursesEmailRealSender);

builder.registerAndUse(NextSuggestedCoursesEmailSender);

// Export container
export const container = builder.build();
