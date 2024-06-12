import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({name:'products'})
export class Product {

    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @ApiProperty()
    @Column('text', {
        unique:true,
    })
    title:string;

    @ApiProperty()
    @Column('float', {
        default:0
    })
    price: number;


    @ApiProperty()  
     @Column({
        type:'text',
        nullable:true
    })
    description:string;

    @ApiProperty()
    @Column('text',{
        unique:true
    })
    slog:string;

    @ApiProperty()
    @Column('int',{
        default:0
    })
    stock:number


    @Column('text',{
        array:true
    })
    sizes: string[]

    @ApiProperty()
    @Column('text')
    gender:string

    @ApiProperty()   //tags
    @Column('text',{
        array:true,
        default:[]
    })
    tags: string[]

    
    
    //images
    @ApiProperty()
    @OneToMany(
    () =>  ProductImage,
    (productImage) => productImage.product,
    {eager:true, }
    )
    images?:ProductImage[]

    @ApiProperty()
    @ManyToOne(
        ()=>User,
        (user)=>user.product,
        {cascade:true, eager:true, }
    )
    user:User



    @BeforeInsert()
    checkSlogInsert()
        {
         if(!this.slog)
            {
            this.slog=this.title;
            }

            this.slog=this.slog
            .replaceAll(" ", "_")
            .replaceAll("'",'')
        }


        @BeforeUpdate()
        checkSlogUpdate()
        {
            this.slog=this.slog
            .toLowerCase()
            .replaceAll(" ", "_")
            .replaceAll("`",'')
            .replaceAll("'",'')
        }

}
