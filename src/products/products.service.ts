
import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, Query } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from "uuid";
import { title } from 'process';
import { ProductImage } from './entities/product-image.entity';


@Injectable()
export class ProductsService {


    private readonly logger= new Logger('ProductsService');


  constructor(
    @InjectRepository(Product)
    private readonly productRepository:Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly imageRepository:Repository<ProductImage>,

    private readonly dataSource: DataSource,
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

        const {images=[], ...productDetails} =createProductDto
          const product = this.productRepository.create({
            ...productDetails,
            images:images.map(image => this.imageRepository.create({url:image}))
          });
          await this.productRepository.save(product);

          return {...product, images};

      } catch (error) {
        this.handleExceptions(error);
      }

  }

    async findAll(paginationDto:PaginationDto) {

      const {limit=10, offset=0}= paginationDto;

  const products = await this.productRepository.find({
    take:limit,
    skip:offset,
    relations:{
      images: true
    }
   });

   return products.map( (product) => ({
    ...product,
    images: product.images.map(img => img.url)
   }))

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
        })
        .leftJoinAndSelect('prod.images','prod.Images')
        .getOne()
       
    }
  
    if (!product) {
      throw new NotFoundException(`Product with term ${term} not found`);
    }
  
    return product;
  }


  async findOnePlain(term: string){
    const {images=[], ...rest} = await this.findOne(term);
    return{
      ...rest,
      images: images.map(image=> image.url)
    }
  }


  async update(id: string, updateProductDto: UpdateProductDto) {

    const {images, ...toUpdate} = updateProductDto;
    

    const product= await this.productRepository.preload({id,...toUpdate });

    if(!product) throw new NotFoundException('Product con id not found');

    ///Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();


    try {

      if(images){
       // this.imageRepository.delete
       await queryRunner.manager.delete(ProductImage, {product:{id}})

       product.images= images.map(
        image=> this.imageRepository.create({url:image})
      )
    }else{

      product.images= await this.imageRepository.findBy({product:{id}})
    }

      await queryRunner.manager.save(product);

      await queryRunner.commitTransaction();
      await queryRunner.release();

     // await this.productRepository.save(product);
      return this.findOnePlain(id);
    } catch (error) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release();


      this.handleExceptions(error);
    }
    
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


  async deleteAllProducts(){
    const query= this.productRepository.createQueryBuilder('product');

    try {
        return await query
        .delete()
        .where({})
        .execute();

    } catch (error) {
        this.handleExceptions(error)
    }

  }

}
function isValidObjectId(id: number) {
  throw new Error('Function not implemented.');
}

