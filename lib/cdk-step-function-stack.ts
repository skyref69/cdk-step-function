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

    // Lambda for state vote
    const stateVote = new aws_lambda_nodejs.NodejsFunction(this,"stateVote",{
      runtime: aws_lambda.Runtime.NODEJS_14_X,      
      entry: 'lambda/stateVote.ts',
      handler: 'stateVote', 
    })

    // INVOCATION Lambda  for state vote
    const stateVoteInvocation = new LambdaInvoke(this, 'state vote invocation', {
     lambdaFunction: stateVote,
     outputPath: '$.Payload',
    });
    
    // Lambda function called if vote is OPEN
    const functionOpenVote = new aws_lambda_nodejs.NodejsFunction(this,"openVote",{
      runtime: aws_lambda.Runtime.NODEJS_14_X,      
      entry: 'lambda/openVote.ts',
      handler: 'openVote', 
      timeout: Duration.seconds(3),
    })

    // INVOCATION lambda if vote is OPEN
    const functionOpenVoteInvocation = new LambdaInvoke(this, 'state vote open', {
      lambdaFunction: functionOpenVote,
      inputPath: '$',
      outputPath: '$',
     });

      // Lambda function called if vote is CLOSED
      const functionClosedVote = new aws_lambda_nodejs.NodejsFunction(this,"closeVote",{
      runtime: aws_lambda.Runtime.NODEJS_14_X,      
      entry: 'lambda/closeVote.ts',
      handler: 'closeVote', 
      timeout: Duration.seconds(3),
    })

    // INVOCATION lambda if vote is CLOSE
    const functionClosedVoteInvocation = new LambdaInvoke(this, 'state vote closed', {
      lambdaFunction: functionClosedVote,
      inputPath: '$',
      outputPath: '$',
     });

    // Lambda function called if vote is UNDEFINED
    const functionUndeStateVote = new aws_lambda_nodejs.NodejsFunction(this,"undefinedStateVote",{
      runtime: aws_lambda.Runtime.NODEJS_14_X,      
      entry: 'lambda/undefinedStateVote.ts',
      handler: 'undefinedStateVote', 
      timeout: Duration.seconds(3),
    })

    // INVOCATION lambda if vote is CLOSE
    const functionUndeStateVoteInvocation = new LambdaInvoke(this, 'state vote undefined', {
      lambdaFunction: functionClosedVote,
      inputPath: '$',
      outputPath: '$',
     });
  
     //Condition to wait 1 second
     const wait1Second = new Wait(this, "Wait 1 Second", {
      time: WaitTime.duration(Duration.seconds(1)),
     });

     //Choice condition for workflow
     const numberChoice = new Choice(this, 'Job Complete?')
      .when(sfn.Condition.stringEquals('$.stateVote', 'open'), functionOpenVoteInvocation)
      .when(sfn.Condition.stringEquals('$.stateVote', 'closed'), functionClosedVoteInvocation)
      .otherwise(functionUndeStateVoteInvocation);

    //Create the workflow definition
    const definition = stateVoteInvocation.next(wait1Second).next(numberChoice);

    //Create the statemachine
    new StateMachine(this, "StateMachine", {
      definition,
      stateMachineName: 'StateVote-StateMachine',
      timeout: Duration.minutes(5),
    });
    
  }
}
