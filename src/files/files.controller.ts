import { Controller, Get, Post,Param, UploadedFile, UseInterceptors,  BadGatewayException, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers/fileNamer.helper';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) {}



  @Get('product/:imageName')
  findProductImage(
    @Res() res:Response,
    @Param('imageName') imageName:string
  ){
      const path= this.filesService.getStaticProductImage(imageName);

     res.sendFile(path);
  }

  @Post('product')
  @UseInterceptors(FileInterceptor('file',{
    fileFilter: fileFilter,
   // 1mb limits:{fileSize:1000}
   storage: diskStorage({
    destination:'./static/uploads',
    filename:fileNamer,
   })
  }))
  
  uploadProductImage(
  @UploadedFile()  file:Express.Multer.File
  ){

    if(!file){
      throw new BadGatewayException('Make sure that the file is an image')
    }

    //const secureUrl = `${file.filename}`;
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;


    return {  secureUrl };
  }
}
