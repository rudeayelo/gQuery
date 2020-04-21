import { ApolloServer, gql } from "apollo-server-micro";
import cheerio from "cheerio";
import { getHTML } from "./_chromium";
const cors = require("micro-cors")();

// const isDev = process.env.NOW_REGION === "dev1";
const isDev = process.env.NODE_ENV === "development";

const typeDefs = gql`
  type Query {
    page(url: String!): Website
  }

  type Website {
    node(selector: String!): [DOMNode]
  }

  type DOMNode {
    html: String
    text: String
    val: String
    attr(name: String!): String
    first(selector: String!): DOMNode
    find(selector: String!): [DOMNode]
  }
`;

const resolvers = {
  Query: {
    page: async (_parent, { url }, { isDev, getHTML, cheerio }) => {
      const html = await getHTML({ isDev, url });

      return cheerio.load(html);
    },
  },
  Website: {
    node: ($, { selector }, _context) => {
      return $(selector).toArray();
    },
  },
  DOMNode: {
    html: (node, _args, { cheerio }) => {
      return cheerio(node).html();
    },
    text: (node, _args, { cheerio }) => {
      return cheerio(node).text();
    },
    val: (node, _args, { cheerio }) => {
      return cheerio(node).val();
    },
    attr: (node, { name }, { cheerio }) => {
      return cheerio(node).attr(name);
    },
    find: (node, { selector }, { cheerio }) => {
      return cheerio(node).find(selector).toArray();
    },
    first: (node, { selector }, { cheerio }) => {
      return cheerio(node).find(selector).first();
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
  context: (integrationContext) => ({
    ...integrationContext,
    cheerio,
    getHTML,
    isDev,
  }),
});

exports.config = {
  api: { bodyParser: false },
};

module.exports = cors((req, res, ...args) => {
  if (req.method === "OPTIONS") {
    return res.status(200).send();
  }

  const handler = server.createHandler({ path: "/api" });

  return handler(req, res, ...args);
});
