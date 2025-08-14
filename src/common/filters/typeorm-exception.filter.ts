import { ExceptionFilter, Catch, ArgumentsHost, HttpException, ConflictException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // Trata erro de duplicidade (MySQL)
    if ((exception as any).code === 'ER_DUP_ENTRY') {
      return response
        .status(409)
        .json({
          statusCode: 409,
          message: 'Já existe um registro com esse valor único.',
          error: 'Conflict',
        });
    }

    if (
      (exception as any).code === 'ER_NO_REFERENCED_ROW_2' ||
      (exception as any).message?.includes('a foreign key constraint fails')
    ) {
      return response
        .status(400)
        .json({
          statusCode: 400,
          message: 'Registro relacionado não existe ou é inválido.',
          error: 'Bad Request',
        });
    }

    if (
      exception.message?.includes("Data too long for column 'unidade_id'")
    ) {
      return response
        .status(400)
        .json({
          statusCode: 400,
          message: "O valor informado para o campo 'unidade_id' está muito longo ou inválido.",
          error: 'Bad Request',
        });
    }

    if (
      exception.message?.includes("Data too long for column 'turma_id'")
    ) {
      return response
        .status(400)
        .json({
          statusCode: 400,
          message: "O valor informado para o campo 'turma_id' está muito longo ou inválido.",
          error: 'Bad Request',
        });
    }

    if (
      exception.message?.includes("Data too long for column 'empresa_id'")
    ) {
      return response
        .status(400)
        .json({
          statusCode: 400,
          message: "O valor informado para o campo 'empresa_id' está muito longo ou inválido.",
          error: 'Bad Request',
        });
    }

    // Outros erros do banco
    return response
      .status(500)
      .json({
        statusCode: 500,
        message: exception.message,
        error: 'Database Error',
      });
  }
}