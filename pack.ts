import * as coda from "@codahq/packs-sdk";
import * as js2flowchart from "js2flowchart";
export const pack = coda.newPack();

pack.addFormula({
    name: "DrawFlowchart",
    description: "Generate flowcharts from JavaScript code",
    parameters: [
        coda.makeParameter({
            type: coda.ParameterType.String,
            name: "code",
            description: "The Javascript code you want to turn to convert to a flowchart.",
        }),
    ],
    resultType: coda.ValueType.String,
    codaType: coda.ValueHintType.ImageReference,
    execute: async function ([code], context) {
        const svg = js2flowchart.convertCodeToSvg(code);
        let encoded = Buffer.from(svg).toString("base64");
        return coda.SvgConstants.DataUrlPrefix + encoded;
    },
});