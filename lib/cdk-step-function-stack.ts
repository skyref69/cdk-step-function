import * as cdk from "@aws-cdk/core";

import * as lambda from "@aws-cdk/aws-lambda";
import * as sfn from "@aws-cdk/aws-stepfunctions";
import * as tasks from "@aws-cdk/aws-stepfunctions-tasks";
import { aws_lambda, aws_lambda_nodejs, Duration, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Choice, StateMachine, Wait, WaitTime } from "aws-cdk-lib/aws-stepfunctions";

export class CdkStepFunctionStack extends Stack {

  public Machine: sfn.StateMachine;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);   

    // Lambda to generate a random number
    const generateRandomNumber = new aws_lambda_nodejs.NodejsFunction(this,"createRandom",{
      runtime: aws_lambda.Runtime.NODEJS_14_X,      
      entry: 'lambda/createRandom.ts',
      handler: 'createRandom', 
    })

    //Lambda invocation for generating a random number
    const generateRandomNumberInvocation = new LambdaInvoke(this, 'Generate random number invocation', {
     lambdaFunction: generateRandomNumber,
     outputPath: '$.Payload',
    });
    
    // Lambda function called if the generated number is greater than the expected number
    const functionGreaterThan = new aws_lambda_nodejs.NodejsFunction(this,"NumberGreaterThan",{
      runtime: aws_lambda.Runtime.NODEJS_14_X,      
      entry: 'lambda/greater.ts',
      handler: 'greater', 
      timeout: Duration.seconds(3),
    })

    // Lambda invocation if the generated number is greater than the expected number
    const greaterThanInvocation = new LambdaInvoke(this, 'Get Number is greater than invocation', {
      lambdaFunction: functionGreaterThan,
      inputPath: '$',
      outputPath: '$',
     });

    // Lambda function called if the generated number is less than or equal to the expected number
    const functionLessThanOrEqual = new aws_lambda_nodejs.NodejsFunction(this,"NumberLessThan",{
      runtime: aws_lambda.Runtime.NODEJS_14_X,      
      entry: 'lambda/lessOrEqual.ts',
      handler: 'lessOrEqual', 
      timeout: Duration.seconds(3),
    })

    // Lambda invocation if the generated number is less than or equal to the expected number
    const lessThanOrEqualInvocation = new LambdaInvoke(this, 'Get Number is less than or equal invocation', {
      lambdaFunction: functionLessThanOrEqual,
      inputPath: '$',
      outputPath: '$',
     });
  
     //Condition to wait 1 second
     const wait1Second = new Wait(this, "Wait 1 Second", {
      time: WaitTime.duration(Duration.seconds(1)),
     });

     //Choice condition for workflow
     const numberChoice = new Choice(this, 'Job Complete?')
      .when(sfn.Condition.numberGreaterThanJsonPath('$.generatedRandomNumber', '$.numberToCheck'), greaterThanInvocation)
      .when(sfn.Condition.numberLessThanEqualsJsonPath('$.generatedRandomNumber', '$.numberToCheck'), lessThanOrEqualInvocation).otherwise(lessThanOrEqualInvocation);

    //Create the workflow definition
    const definition = generateRandomNumberInvocation.next(wait1Second).next(numberChoice);

    //Create the statemachine
    new StateMachine(this, "StateMachine", {
      definition,
      stateMachineName: 'randomNumberStateMachine',
      timeout: Duration.minutes(5),
    });
    
  }
}
