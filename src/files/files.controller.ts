import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, NotFoundException, BadGatewayException } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter';
import { diskStorage } from 'multer';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {
   
  }

  @Post('product')
  @UseInterceptors(FileInterceptor('file',{
    fileFilter: fileFilter,
   // 1mb limits:{fileSize:1000}
   storage: diskStorage({
    destination:'./static/uploads'
   })
  }))
  uploadProductImage(
  @UploadedFile()  file:Express.Multer.File
  ){

    if(!file){
      throw new BadGatewayException('Make sure that the file is an image')
    }

    return file
  }
}
