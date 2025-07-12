import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";

/**
 * Parses user-submitted JS code and attaches the given function to the global object.
 *
 * @param code Raw JavaScript code string
 * @param functionName Name of the function the runner will call
 * @returns Modified JS code string with global[functionName] assignment
 */
export function attachToGlobal(code: string, functionName: string): string {
  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"], // supports JSX/TS if user submits them
  });

  let found = false;

  traverse(ast, {
    FunctionDeclaration(path) {
      if (path.node.id?.name === functionName) {
        const globalAssign = t.expressionStatement(
          t.assignmentExpression(
            "=",
            t.memberExpression(t.identifier("global"), t.identifier(functionName)),
            t.functionExpression(
              null,
              path.node.params,
              path.node.body,
              path.node.generator,
              path.node.async
            )
          )
        );
        path.replaceWith(globalAssign);
        found = true;
      }
    },
    VariableDeclaration(path) {
      for (const decl of path.node.declarations) {
        if (
          t.isIdentifier(decl.id) &&
          decl.id.name === functionName &&
          (t.isFunctionExpression(decl.init) || t.isArrowFunctionExpression(decl.init))
        ) {
          const globalAssign = t.expressionStatement(
            t.assignmentExpression(
              "=",
              t.memberExpression(t.identifier("global"), t.identifier(functionName)),
              decl.init!
            )
          );
          path.replaceWith(globalAssign);
          found = true;
        }
      }
    },
    ExportDefaultDeclaration(path) {
      if (t.isFunctionDeclaration(path.node.declaration)) {
        const globalAssign = t.expressionStatement(
          t.assignmentExpression(
            "=",
            t.memberExpression(t.identifier("global"), t.identifier(functionName)),
            t.functionExpression(
              null,
              path.node.declaration.params,
              path.node.declaration.body,
              path.node.declaration.generator,
              path.node.declaration.async
            )
          )
        );
        path.replaceWith(globalAssign);
        found = true;
      }
    },
  });

  if (!found) {
    throw new Error(`Function "${functionName}" not found in submitted code.`);
  }

  const { code: modifiedCode } = generate(ast, {}, code);
  return modifiedCode;
}