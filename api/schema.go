// GENERATED from sourcegraph.schema - DO NOT EDIT

package api

var Schema = `schema {
	query: Query
}

interface Node {
	id: ID!
}

type Query {
	root: Root
	node(id: ID!): Node
}

type Root {
	repository(uri: String!): Repository
}

type Repository implements Node {
	id: ID!
	uri: String!
	commit(rev: String!): CommitState!
	latest: CommitState!
	branches: [String!]!
	tags: [String!]!
}

type CommitState {
	commit: Commit
	cloneInProgress: Boolean!
}

type Commit implements Node {
	id: ID!
	sha1: String!
	tree(path: String = "", recursive: Boolean = false): Tree
	file(path: String!): File
	languages: [String!]!
}

type Tree {
	directories: [Directory]!
	files: [File]!
}

type Directory {
	name: String!
	tree: Tree!
}

type File {
	name: String!
	content: String!
}
`
