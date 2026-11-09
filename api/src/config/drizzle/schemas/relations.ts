import { defineRelations } from "drizzle-orm";
import { options, questions, quizzes, users } from "./index.js";

export const relations = defineRelations({ users, quizzes, questions, options }, (r) => ({
  quizzes: {
    author: r.one.users({
      from: r.quizzes.authorId,
      to: r.users.id,
      optional: false,
      alias: 'quizzes_authors_fk',
    })
  },
  questions: {
    forQuiz: r.one.quizzes({
      from: r.questions.quizId,
      to: r.quizzes.id,
      optional: false,
      alias: 'questions_quiz_fk'
    })
  },
  options: {
    forQuestion: r.one.questions({
      from: r.options.questionId,
      to: r.questions.id,
      optional: false,
      alias: 'options_questions_fk'
    })
  },
}));
