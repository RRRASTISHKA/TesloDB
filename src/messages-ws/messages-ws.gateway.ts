import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces/jwt.strategy';
@WebSocketGateway({cors: true})
export class MessagesWsGateway implements OnGatewayConnection,OnGatewayDisconnect {

  @WebSocketServer() wss: Server
  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService:JwtService
  ) {}

  //console.log('Cliente conectado',client.id);
   //console.log({connectados: this.messagesWsService.getConnectedClients()})

   
  async handleConnection(client:Socket) {
    const token = client.handshake.headers.authentication as string;
    let payload:JwtPayload;
    try {
      payload= this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client,payload.id);
    } catch (error) {
      client.disconnect();
      return;
    }

    //console.log(payload)
   // client.join('ventas');
    //client.join(client.id);
    //client.join(user.email);
    //this.wss.to('ventas').emit('');
   
    this.wss.emit('clients-updated',this.messagesWsService.getConnectedClients())
  }
  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id);

    this.wss.emit('clients-updated',this.messagesWsService.getConnectedClients())
  }


  @SubscribeMessage('message-from-client')
 async onMessageFromClient(client:Socket, payload:NewMessageDto){


    //message-from-server //! Emite unicamente al cliente
    //client.emit('message-from-server',{
      //fullname:'Soy yo!',
     // message: payload.message || 'no-message'
 //   });

    //!Emitir a todos Menos, al cliente inicial
    //client.broadcast.emit('message-from-server',{
    //  fullname:'Soy yo!',
     // message: payload.message || 'no-message'
   // });

   this.wss.emit('message-from-server', {
    fullName: this.messagesWsService.getUserFullName(client.id),
    message: payload.message || 'no-message!!'
  });

 }
}
