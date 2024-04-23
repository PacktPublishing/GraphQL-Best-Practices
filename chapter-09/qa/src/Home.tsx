import { QuestionResponseListSelector, QuestionResponseListType } from "@/graphql/selectors"
import { Gql } from "@/zeus"
import { useEffect, useState } from "react"

 const Home = () => {
    const [topQuestions,setTopQuestions] = useState<QuestionResponseListType[]>()
    useEffect(() => {
        Gql("query")({
            top:QuestionResponseListSelector
        }).then(r => {
            setTopQuestions(r.top)
        })
    },[])
    return <div>
        {topQuestions?.map(({question}) => {
            return <div className="space-x-4 flex" key={question._id}>
                <div className="text-2xl">{question.score}</div>
                <div className="text-xl">{question.title}</div>
            </div>
        })}
    </div>
 }
 export default Home