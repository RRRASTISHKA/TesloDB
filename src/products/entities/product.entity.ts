import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";

@Entity({name:'products'})
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id:string;


    @Column('text', {
        unique:true,
    })
    title:string;


    @Column('float', {
        default:0
    })
    price: number;


    @Column({
        type:'text',
        nullable:true
    })
    description:string;


    @Column('text',{
        unique:true
    })
    slog:string;


    @Column('int',{
        default:0
    })
    stock:number


    @Column('text',{
        array:true
    })
    sizes: string[]


    @Column('text')
    gender:string

    //tags
    @Column('text',{
        array:true,
        default:[]
    })
    tags: string[]
    
    
    //images
    @OneToMany(
    () =>  ProductImage,
    (productImage) => productImage.product,
    {cascade:true, eager:true, }
    )
    images?:ProductImage[]



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
