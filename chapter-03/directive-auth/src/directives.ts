import { defaultFieldResolver } from "graphql";
import { YogaInitialContext } from "graphql-yoga";
import { createDirectives } from "@/src/axolotl.js";


export default createDirectives({
    auth:(schema,getDirective) => ({
        "MapperKind.OBJECT_FIELD": (fieldConfig) => {
            const directive = getDirective(schema,fieldConfig,'auth')
            if(directive){
                const { resolve = defaultFieldResolver } = fieldConfig
                return {
                    ...fieldConfig,
                    resolve: async (source,args,context:YogaInitialContext,info) => {
                        const headerValue = context.request.headers.get("Auth")
                        if(headerValue !== 'password'){
                            throw new Error("You are not authorized")
                        }
                        return resolve(source,args,context,info)
                    } 
                }
            }
        }
    })
})