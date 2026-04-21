import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sns = new SNSClient({ region: process.env.AWS_REGION });
const sqs = new SQSClient({ region: process.env.AWS_REGION });

export const enviarEmailBienvenida = async (email, nombre) => {
  try {
    await sns.send(
      new PublishCommand({
        TopicArn: process.env.SNS_TOPIC_ARN,
        Subject: "Bienvenido a Expense Tracker",
        Message: `Hola ${nombre}, tu cuenta fue creada exitosamente.`
      })
    );
    console.log("Email de bienvenida enviado:", email);
  } catch (error) {
    console.error("Error SNS:", error);
  }
};

export const encolarGasto = async (userId, expenseId, amount) => {
  try {
    await sqs.send(
      new SendMessageCommand({
        QueueUrl: process.env.SQS_QUEUE_URL,
        MessageBody: JSON.stringify({
          type: "expense_created",
          userId,
          expenseId,
          amount,
          timestamp: new Date().toISOString()
        })
      })
    );
    console.log("Gasto encolado:", expenseId);
  } catch (error) {
    console.error("Error SQS:", error);
  }
};