import { mergeSDLs } from "graphql-js-tree";
import fs from 'node:fs'
import path from 'node:path'

const mergeSchemas = (examplePath:string) => {
    const inputPath = path.join(examplePath,'input')
    const outputPath = path.join(examplePath,'output')
    const inputSchemas = fs.readdirSync(inputPath).filter(f => f.endsWith("graphql")).map(f => fs.readFileSync(path.join(inputPath,f),'utf-8'))
    let baseSchema = ``
    for( const schema of inputSchemas){
        const merge = mergeSDLs(baseSchema,schema)
        if(merge.__typename === 'error'){
            throw new Error(`[${inputPath}], Cant merge the schemas. ${merge.errors.map(e => `Conflict on: ${e.conflictingNode}.${e.conflictingField}`)}`)
        }
        baseSchema = merge.sdl
    }
    console.log(`Merge successful`, outputPath)
    fs.writeFileSync(path.join(outputPath,'schema.graphql'),baseSchema)
}

const mergeAll = () => {
    const examplePath = path.join(process.cwd(),'schemas');
    const examples = fs.readdirSync(examplePath)
    for(const example of examples){
       try {
         mergeSchemas(path.join(examplePath,example))
       } catch (error) {
            if(error instanceof Error) console.error(error.message)
       }
    }
}

mergeAll()