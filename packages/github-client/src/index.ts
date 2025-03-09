// import { Client, cacheExchange, fetchExchange } from "urql";
import { Client, cacheExchange, fetchExchange } from "urql";
import { graphql } from "./graphql";

export const IssueNodeIdQuery = graphql(/* GraphQL */ `
  query IssueNodeIdQuery($name: String!, $owner: String!, $issueNumber: Int!) {
    repository(name: $name, owner: $owner) {
        issue(number: $issueNumber) {
            id
            title
        }
    }
  }
`);

export const IssueCommentNodeIdQuery = graphql(/* GraphQL */ `
  query IssueCommentNodeIdQuery($name: String!, $owner: String!, $issueNumber: Int!) {
    repository(name: $name, owner: $owner) {
        issue(number: $issueNumber) {
            id
            title
            comments(first: 100) {
                nodes {
                    id
                }
            }
        }
    }
  }
`);

export function githubClient(token: string) {
	return new Client({
		url: "https://api.github.com/graphql",
		exchanges: [cacheExchange, fetchExchange],
		fetchOptions: {
			headers: { authorization: `Bearer ${token}` },
		},
	});
}
