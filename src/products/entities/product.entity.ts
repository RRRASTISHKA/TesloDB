import { text } from "stream/consumers";
import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
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
