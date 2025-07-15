import { graphql } from "../../graphql";

export const GetPullRequestInfoQuery = graphql(`
	query GetPullRequestInfo(
		$owner: String!
		$repo: String!
		$number: Int!
		$commentLimit: Int = 100
	) {
		repository(owner: $owner, name: $repo) {
			pullRequest(number: $number) {
				title
				body
				merged
				mergedAt
				comments(last: $commentLimit) {
					nodes {
						id
						body
						author {
							__typename
							... on Bot {
								login
							}
							... on User {
								login
							}
						}
					}
					pageInfo {
						hasPreviousPage
						startCursor
					}
				}
				headCommit: commits(last: 1) {
					nodes {
						commit {
							oid
							tree {
								entries {
									path
									isGenerated
									extension
									language {
										name
									}
									lineCount
									object {
										... on Blob {
											byteSize
											isBinary
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
`);
