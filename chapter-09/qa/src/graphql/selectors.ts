import { FromSelector, Selector } from "@/zeus";

export const AnswerListSelector = Selector('Answer')({
    _id:true,
    content:true,
    score:true,
    createdAt:true,
    user:{
        username:true
    }
})

export const QuestionResponseListSelector = Selector('QuestionsResponse')({
    question:{
        title:true,
        score:true,
        _id:true,
        createdAt:true,
        user:{
            username:true
        }
    },
    bestAnswer:{
        content:true,
        score:true,
        user:{
            username:true
        }
    }
})
export type QuestionResponseListType = FromSelector<typeof QuestionResponseListSelector,'QuestionsResponse'>

export const QuestionDetailSelector = Selector('Question')({
    _id:true,
    content:true,
    score:true,
    title:true,
    createdAt:true,
    updatedAt:true,
    answers:AnswerListSelector,
    user:{
        username:true
    }
})

export const AnswerDetailSelector = Selector('Answer')({
    _id:true,
    content:true,
    score:true,
    createdAt:true,
    updatedAt:true,
    answers:AnswerListSelector,
    user:{
        username:true
    }
})
