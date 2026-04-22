import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sns = new SNSClient({ region: process.env.AWS_REGION });
const sqs = new SQSClient({ region: process.env.AWS_REGION });

export const enviarNotificacionRegistro = async (email, nombre) => {
  try {
    await sns.send(
      new PublishCommand({
        TopicArn: process.env.SNS_TOPIC_ARN,
        Subject: "Nuevo Usuario Registrado - Expense Tracker",
        Message: `Se ha registrado un nuevo usuario!\n\nEmail: ${email}\nNombre: ${nombre}\nFecha: ${new Date().toISOString()}`
      })
    );
    console.log("Notificacion de registro enviada:", email);
  } catch (error) {
    console.error("Error SNS registro:", error);
  }
};

export const encolarGasto = async (userId, expenseId, amount, category, description, email) => {
  try {
    await sqs.send(
      new SendMessageCommand({
        QueueUrl: process.env.SQS_QUEUE_URL,
        MessageBody: JSON.stringify({
          type: "expense_created",
          userId,
          expenseId,
          amount,
          category,
          description,
          email,
          timestamp: new Date().toISOString()
        })
      })
    );
    console.log("Gasto encolado:", expenseId);
  } catch (error) {
    console.error("Error SQS:", error);
  }
};