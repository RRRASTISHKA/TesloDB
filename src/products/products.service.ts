
import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from "uuid";
import { title } from 'process';


@Injectable()
export class ProductsService {


    private readonly logger= new Logger('ProductsService');


  constructor(
    @InjectRepository(Product)
    private readonly productRepository:Repository<Product>,
  ){}


 async create(createProductDto: CreateProductDto) {

  //if(!createProductDto.slog){
    //createProductDto.slog=createProductDto.title.toLowerCase()
    //.replaceAll(" ", "_")
    //.replaceAll("'",'')
  //}else{
   //createProductDto.slog=createProductDto.title.toLowerCase()
    //.replaceAll(" ", "_")
    //.replaceAll("'",'')
 // }

      try {
          const product = this.productRepository.create(createProductDto);
          await this.productRepository.save(product);

          return product;

      } catch (error) {
        this.handleExceptions(error);
      }

  }

    findAll(paginationDto:PaginationDto) {

      const {limit=10, offset=0}= paginationDto;

   return  this.productRepository.find({
    take:limit,
    skip:offset
   });
  }

  async findOne(term: string) {
    let product: Product;
  
    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('product');
      const query = queryBuilder
        .where('UPPER(product.title) = :title OR product.slog = :slog', {
          title: term.toUpperCase(),
          slog: term.toLowerCase(),
        });
  
      console.log(query.getSql(), query.getParameters()); 
  
      product = await query.getOne();
    }
  
    if (!product) {
      throw new NotFoundException(`Product with term ${term} not found`);
    }
  
    return product;
  }


  async update(id: string, updateProductDto: UpdateProductDto) {

    const product= await this.productRepository.preload({
      id:id,
      ...updateProductDto
    });

    if(!product) throw new NotFoundException('Product con id not found');
    try {
      await this.productRepository.save(product);
     
    } catch (error) {
      this.handleExceptions(error);
    }
    return product;
  }

  async remove(id: string) {

    const product= await this.findOne(id);

    await this.productRepository.remove(product);

  }

  private handleExceptions(error:any){
    
        if(error.code === '23505') throw new BadRequestException(error.detail);

        this.logger.error(error)
        throw new InternalServerErrorException('Unexpected error, check server logs')
  }

}
function isValidObjectId(id: number) {
  throw new Error('Function not implemented.');
}

