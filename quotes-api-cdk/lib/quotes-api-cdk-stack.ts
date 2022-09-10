import * as cdk from "aws-cdk-lib";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { join } from "path";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { RemovalPolicy } from "aws-cdk-lib";

export class QuotesApiCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new Table(this, "quotes-table", {
      partitionKey: { name: "id", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const getQuotesFromLambdaDynamoDBhandler = new Function(
      this,
      "quotesHandler",
      {
        runtime: Runtime.NODEJS_14_X,
        memorySize: 512,
        handler: "app.handler",
        environment: {
          MY_TABLE: table.tableName,
        },
        code: Code.fromAsset(join(__dirname, "../lambdas")),
      }
    );

    // hard coded to retrieve from file

    /*
    const getQuotes = new Function(this, "Quotes-lambda", {
      runtime: Runtime.NODEJS_14_X,
      memorySize: 512,
      handler: "getQuotes.handler",
      code: Code.fromAsset(join(__dirname, "../lambdas")),
    });

    */

    table.grantReadWriteData(getQuotesFromLambdaDynamoDBhandler);
    const api = new RestApi(this, "quotes-api", {
      description: "Quotes API Gateway",
    });

    // create path /quotes
    const mainPath = api.root.addResource("quotes");

    const idPath = mainPath.addResource("{id}");

    // create method GET for /quotes
    // mainPath.addMethod("GET", new LambdaIntegration(getQuotes));

    const integrationHandler = new LambdaIntegration(
      getQuotesFromLambdaDynamoDBhandler
    );
    mainPath.addMethod("GET", integrationHandler);
    mainPath.addMethod("POST", integrationHandler);

    // DELETE, PUT /quotes/{id}
    idPath.addMethod("DELETE", integrationHandler);
    idPath.addMethod("PUT", integrationHandler);

    // mainPath.addMethod("POST", integrationHandler);
  }
}
