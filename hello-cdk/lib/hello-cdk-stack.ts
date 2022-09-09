import * as cdk from "aws-cdk-lib";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { join } from "path";

export class HelloCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const handler = new Function(this, "Hello-lambda", {
      runtime: Runtime.NODEJS_14_X,
      memorySize: 512,
      handler: "app.handler",
      code: Code.fromAsset(join(__dirname, "../lambdas")),
    });
  }
}
