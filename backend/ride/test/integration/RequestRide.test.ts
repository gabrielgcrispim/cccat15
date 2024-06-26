import sinon from "sinon";
import RequestRide from "../../src/application/usecase/RequestRide";
import RideRepository, { RideRepositoryDataBase } from "../../src/infra/repository/RideRepository";
import DataBaseConnection, { PgPromisseAdapter } from "../../src/infra/database/DataBaseConnection";
import GetRide from "../../src/application/usecase/GetRide";
import AccountGetway from "../../src/infra/gateway/AccountGateway";
import { AccountGetwayHttp } from "../../src/infra/gateway/AccountGatewayHttp";

let rideRepository : RideRepository;
let connection : DataBaseConnection;
let getRide : GetRide;
let accountGetway: AccountGetway;
let requestRide: RequestRide;

beforeEach(function() { 
    connection = new PgPromisseAdapter();
    accountGetway = new AccountGetwayHttp();
    rideRepository = new RideRepositoryDataBase(connection);
    requestRide = new RequestRide(accountGetway, rideRepository);
    getRide = new GetRide(rideRepository, accountGetway);
});

test("Solicita uma corrida se o usuário for um passageiro", async function() {
    const newAccount = {
        "name" : "John Doe",
        "email": `john.doe${Math.random()}@gmail.com`,
        "cpf": "97456321558",
        "isPassenger": true
    };

   const outPutSignUp = await accountGetway.signUp(newAccount);

    //Given
    const input = {
        passengerId: outPutSignUp.accountId,
        fromLat : 27.8990870709,
        fromLong: 28.89080970,
        toLat: -29.8790809890,
        toLong: -27.09809890
      }
    
    const outPutRide = await requestRide.execute(input);
    expect(outPutRide.rideId).toBeDefined();
    const outPutGetRide = await getRide.execute(outPutRide.rideId);
    expect(outPutGetRide.passengerId).toBe(input.passengerId);
    expect(outPutGetRide.passengerName).toBe("John Doe");
    expect(outPutGetRide.fromLat).toBe(input.fromLat);
    expect(outPutGetRide.fromLong).toBe(input.fromLong);
    expect(outPutGetRide.toLat).toBe(input.toLat);
    expect(outPutGetRide.toLong).toBe(input.toLong);
    expect(outPutGetRide.status).toBe("REQUESTED");
    expect(outPutGetRide.date).toBeDefined();
   


});

test("Deve lançar uma exceção caso o usuário tenha corridas com status diferente de COMPLETED", async function() {
    const newAccount = {
        "name" : "John Doe",
        "email": `john.doe${Math.random()}@gmail.com`,
        "cpf": "97456321558",
        "isPassenger": true
    };

   const outPutSignUp = await accountGetway.signUp(newAccount);

    //Given
    const input = {
        passengerId: outPutSignUp.accountId,
        fromLat : 27.8990870709,
        fromLong: 28.89080970,
        toLat: -29.8790809890,
        toLong: -27.09809890
      }

    await requestRide.execute(input);
    await expect(() => requestRide.execute(input)).rejects.toThrow(new Error("New ride can't be created"));
});


test("Deve lançar uma exceção caso o usuário não seja um passageiro", async function() {
    const newAccount = {
        "name" : "John Doe",
        "email": `john.doe${Math.random()}@gmail.com`,
        "cpf": "97456321558",
        "isDriver": true,
        "carPlate": "ABC1234"
    };

   const outPutSignUp = await accountGetway.signUp(newAccount);

    //Given
    const input = {
        passengerId: outPutSignUp.accountId,
        fromLat : 27.8990870709,
        fromLong: 28.89080970,
        toLat: -29.8790809890,
        toLong: -27.09809890
      }

    await expect(() => requestRide.execute(input)).rejects.toThrow(new Error("User is not a passenger"));
});

afterEach(async() => {
    await connection.close();
  })