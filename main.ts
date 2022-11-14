import { Server } from "./server/server";
import { userRouter } from "./users/users.router";
import { restaurantRouter } from "./restaurants/restaurants.router";

const server = new Server();

//vai fazer o bootstrap do servidor
server.bootstrap([userRouter, restaurantRouter])
    .then(server => {
        console.log('Server is listening on:', server.application.address());
    }).catch(error => {
        console.log('Server failed to start');
        console.error(error);
        process.exit(1);
    });
