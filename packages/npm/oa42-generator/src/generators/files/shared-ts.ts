import * as models from "../../models/index.js";
import { banner, toCamel, toPascal } from "../../utils/index.js";
import { itt } from "../../utils/iterable-text-template.js";

export function* generateSharedTsCode(apiModel: models.Api) {
  yield banner;

  for (const pathModel of apiModel.paths) {
    for (const operationModel of pathModel.operations) {
      const operationAcceptTypeName = toPascal(operationModel.name, "operation", "accept");
      const operationAcceptConstName = toCamel(operationModel.name, "operation", "accept");

      const operationAccepts = [
        ...new Set(
          operationModel.operationResults.flatMap((operationResultModel) =>
            operationResultModel.bodies.map((bodyModel) => bodyModel.contentType),
          ),
        ),
      ];

      yield itt`
        export type ${operationAcceptTypeName} = ${
          operationAccepts.length > 0
            ? operationAccepts.map((operationAccept) => JSON.stringify(operationAccept)).join(" | ")
            : "never"
        };
      `;

      yield itt`
        export const ${operationAcceptConstName}: ${operationAcceptTypeName}[] = ${JSON.stringify(operationAccepts)};
      `;
    }
  }
}