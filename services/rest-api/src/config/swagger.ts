import authDocs from "../auth/authDocs.json";
import locationDocs from "../location/locationDocs.json";
import commentDocs from "../comment/commentDocs.json";
import eventDocs from "../event/eventDocs.json";
import favoriteDocs from "../favorites/favoritesDocs.json";

const SWAGGER_OPTIONS = {
  definition: {
    openapi: "3.1.10",
    info: {
      title: "Todo API",
      version: "1.0.0",
      description: "PetSpot API",
    },
    servers: [
      {
        url: `${process.env.API_URL}${process.env.PORT ?? 8080}`,
      },
    ],
    paths: {
      ...authDocs.paths,
      ...locationDocs.paths,
      ...commentDocs.paths,
      ...eventDocs.paths,
      ...favoriteDocs.paths,
    },
    components: {
      schemas: {
        ...authDocs.components.schemas,
        ...locationDocs.components.schemas,
        ...commentDocs.components.schemas,
        ...eventDocs.components.schemas,
        ...favoriteDocs.components.schemas,
      },
    },
  },
  apis: [],
};
export default SWAGGER_OPTIONS;
