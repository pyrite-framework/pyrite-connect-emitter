# pyrite-connect

## Install

```
npm install pyrite-connect
npm install pyrite-connect-emitter
```

## Example

```typescript
import { PyriteConnect } from "pyrite-connect";
import { EmitterPlugin } from "pyrite-connect-emitter";

const connect = new PyriteConnect({
  url: 'http://localhost:8080',
  plugins: [new EmitterPlugin()]
});

connect.getRoutes()
.then((routes) => {
  routes.Users.on.createUser((data, id) => {
    console.log(data, id);

    routes.Users.off.createUser();
  });
});
```
