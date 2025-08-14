import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConteudoController } from './conteudo.controller';
import { ConteudoService } from './conteudo.service';
import { Conteudo, ConteudoArquivo, ConteudoImagem, ConteudoLink, ConteudoTexto } from './entity/conteudo.entity';
import { UserAccessLevel } from '../auth/entity/user_access_levels.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conteudo,
      ConteudoArquivo,
      ConteudoImagem,
      ConteudoLink,
      ConteudoTexto,
      UserAccessLevel, // Adicione aqui!
    ]),
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const isImage = file.mimetype.startsWith('image/');
          cb(null, isImage ? './arc/image' : './arc/document');
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  ],
  controllers: [ConteudoController],
  providers: [ConteudoService],
  exports: [ConteudoService],
})
export class ConteudoModule {}