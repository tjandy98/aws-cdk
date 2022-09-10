import * as cdk from "aws-cdk-lib";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { join } from "path";
import * as iam from "aws-cdk-lib/aws-iam";

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class HelloCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const handler = new Function(this, "Hello-lambda", {
      // runtime: Runtime.NODEJS_14_X,
      runtime: Runtime.PYTHON_3_9,
      memorySize: 512,
      // handler: "app.handler",
      handler: "listBuckets.main",
      code: Code.fromAsset(join(__dirname, "../lambdas")),
      environment: {
        MESSAGE: "Message from env",
      },
    });

    const listBucketPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["s3:*"],
      resources: ["*"],
    });

    handler.role?.attachInlinePolicy(
      new iam.Policy(this, "list-resources", {
        statements: [listBucketPolicy],
      })
    );
    new cdk.CfnOutput(this, "function-arn", { value: handler.functionArn });
  }
}
