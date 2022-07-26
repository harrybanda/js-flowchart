import * as coda from "@codahq/packs-sdk";
import * as js2flowchart from "js2flowchart";
import { listenerCount } from "process";
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
        coda.makeParameter({
            type: coda.ParameterType.String,
            name: "theme",
            description: "The theme for your flowchart.",
            optional: true,
            autocomplete: ["DEFAULT", "GRAY", "LIGHT"]
        }),
        coda.makeParameter({
            type: coda.ParameterType.StringArray,
            name: "abstraction",
            description: "The abstraction levels to render.",
            optional: true,
            suggestedValue: ["IMPORT", "EXPORT"],
        }),
    ],
    resultType: coda.ValueType.String,
    codaType: coda.ValueHintType.ImageReference,
    execute: async function ([code, theme = "DEFAULT", abstraction], context) {
        const { ABSTRACTION_LEVELS, createFlowTreeBuilder, createSVGRender } = js2flowchart;

        const svgRender = createSVGRender();
        if (theme !== undefined) {
            const themeOptions = ["DEFAULT", "GRAY", "LIGHT"];

            if (!themeOptions.includes(theme)) {
                throw new coda.UserVisibleError("Unknown value: " + abstraction);
            }

            if (theme === "GRAY") {
                svgRender.applyBlackAndWhiteTheme();
            } else if (theme === "LIGHT") {
                svgRender.applyLightTheme();
            } else {
                svgRender.applyDefaultTheme();
            }
        }

        const flowTreeBuilder = createFlowTreeBuilder();
        if (abstraction !== undefined) {
            let abs = [];
            if (abstraction.includes("FUNCTION")) abs.push(ABSTRACTION_LEVELS.FUNCTION);
            if (abstraction.includes("FUNCTION_DEPENDENCIES")) abs.push(ABSTRACTION_LEVELS.FUNCTION_DEPENDENCIES);
            if (abstraction.includes("CLASS")) abs.push(ABSTRACTION_LEVELS.CLASS);
            if (abstraction.includes("IMPORT")) abs.push(ABSTRACTION_LEVELS.IMPORT);
            if (abstraction.includes("EXPORT")) abs.push(ABSTRACTION_LEVELS.EXPORT);
            flowTreeBuilder.setAbstractionLevel(abs);
        }

        const flowTree = flowTreeBuilder.build(code);
        const shapesTree = svgRender.buildShapesTree(flowTree);
        const svg = shapesTree.print();

        let encoded = Buffer.from(svg).toString("base64");
        return coda.SvgConstants.DataUrlPrefix + encoded;
    },
});

