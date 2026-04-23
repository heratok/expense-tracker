import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

console.log("[AWS-SERVICE] Iniciando modulo AWS Service");
console.log("[AWS-SERVICE] AWS_REGION:", process.env.AWS_REGION);
console.log("[AWS-SERVICE] SNS_TOPIC_ARN:", process.env.SNS_TOPIC_ARN);
console.log("[AWS-SERVICE] SQS_QUEUE_URL:", process.env.SQS_QUEUE_URL);
console.log("[AWS-SERVICE] AWS_ACCESS_KEY_ID set:", !!process.env.AWS_ACCESS_KEY_ID);
console.log("[AWS-SERVICE] AWS_SECRET_ACCESS_KEY set:", !!process.env.AWS_SECRET_ACCESS_KEY);
console.log("[AWS-SERVICE] AWS_SESSION_TOKEN set:", !!process.env.AWS_SESSION_TOKEN);

const snsConfig = { region: process.env.AWS_REGION };
if (process.env.AWS_ACCESS_KEY_ID) {
  snsConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN
  };
}

const sqsConfig = { region: process.env.AWS_REGION };
if (process.env.AWS_ACCESS_KEY_ID) {
  sqsConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN
  };
}

const sns = new SNSClient(snsConfig);
const sqs = new SQSClient(sqsConfig);

export const enviarNotificacionRegistro = async (email, nombre) => {
  console.log("[SNS-REGISTRO] Iniciando envio de notificacion de registro");
  console.log("[SNS-REGISTRO] Email:", email, "Nombre:", nombre);
  console.log("[SNS-REGISTRO] TopicArn:", process.env.SNS_TOPIC_ARN);
  try {
    const result = await sns.send(
      new PublishCommand({
        TopicArn: process.env.SNS_TOPIC_ARN,
        Subject: "Nuevo Usuario Registrado - Expense Tracker",
        Message: `Se ha registrado un nuevo usuario!\n\nEmail: ${email}\nNombre: ${nombre}\nFecha: ${new Date().toISOString()}`
      })
    );
    console.log("[SNS-REGISTRO] EXITO! MessageId:", result.MessageId);
  } catch (error) {
    console.error("[SNS-REGISTRO] ERROR nombre:", error.name);
    console.error("[SNS-REGISTRO] ERROR mensaje:", error.message);
    console.error("[SNS-REGISTRO] ERROR code:", error.Code || error.$metadata?.httpStatusCode);
    console.error("[SNS-REGISTRO] ERROR completo:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
  }
};

export const encolarGasto = async (userId, expenseId, amount, category, description, email) => {
  console.log("[SQS-GASTO] Iniciando encolado de gasto");
  console.log("[SQS-GASTO] expenseId:", expenseId, "amount:", amount, "category:", category);
  console.log("[SQS-GASTO] QueueUrl:", process.env.SQS_QUEUE_URL);
  try {
    const result = await sqs.send(
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
    console.log("[SQS-GASTO] EXITO! MessageId:", result.MessageId);
  } catch (error) {
    console.error("[SQS-GASTO] ERROR nombre:", error.name);
    console.error("[SQS-GASTO] ERROR mensaje:", error.message);
    console.error("[SQS-GASTO] ERROR code:", error.Code || error.$metadata?.httpStatusCode);
    console.error("[SQS-GASTO] ERROR completo:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
  }
};

export const encolarExportacionSQS = async (userId, filtros) => {
  console.log("[SQS-EXPORT] Iniciando encolado de exportacion");
  console.log("[SQS-EXPORT] UserId:", userId, "Filtros:", filtros);
  console.log("[SQS-EXPORT] QueueUrl:", process.env.SQS_QUEUE_URL);
  try {
    const result = await sqs.send(
      new SendMessageCommand({
        QueueUrl: process.env.SQS_QUEUE_URL,
        MessageBody: JSON.stringify({
          tipo: "exportacion_gastos",
          userId,
          filtros: filtros || {},
          timestamp: new Date().toISOString()
        })
      })
    );
    console.log("[SQS-EXPORT] EXITO! MessageId:", result.MessageId);
  } catch (error) {
    console.error("[SQS-EXPORT] ERROR nombre:", error.name);
    console.error("[SQS-EXPORT] ERROR mensaje:", error.message);
    console.error("[SQS-EXPORT] ERROR code:", error.Code || error.$metadata?.httpStatusCode);
    console.error("[SQS-EXPORT] ERROR completo:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
  }
};