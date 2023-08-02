# Boats utils

Collection of useful boats template helpers to be used with [j-d-carmichael/boats](https://github.com/j-d-carmichael/boats).

<!--
npx doctoc --github readme.md
-->
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Usage](#usage)
- [Modules](#modules)
  - [`extend`](#extend)
    - [Examples](#examples)
  - [`database-entry`](#database-entry)
    - [Examples](#examples-1)
  - [`pagination`](#pagination)
    - [Examples](#examples-2)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Usage

```bash
npm install @acrontum/boats-utils
````

In your openapi boats project, simply include this module as a helper in your build command:

```json
{
  "name": "service-openapi-spec",
  "version": "1.0.0",
  "description": "Some boats openapi builder",
  "scripts": {
    "prebuild": "rm -rf build",
    "build": "NODE_ENV=test boats --yes -f node_modules/@acrontum/boats-utils/dist -i ./src/index.yml -o ./build/api.yml",
    "postbuild": "cp build/api*.yml ./release/$npm_package_name.yml"
  },
  "keywords": [],
  "author": "p-mcgowan",
  "devDependencies": {
    "boats": "^2.25.0",
    "@acrontum/boats-utils": "^1.0.0"
  }
}
```

## Modules


### [`extend`](./src/extend.ts)

Extend a base model with additional, omitted, required, and / or optional fields.

```yaml
# model.yml

type: object
properties:
  id:
    type: string
    format: uuid
  name:
    type: string
  email:
    type: string
    format: email
  profilePicture:
    type: string
    format: uri
  # ...
```

```yaml
# postModel.yml

{{
  extend('./model.yml', {
    omit: [
      'properties.id'
    ],
    require: [
      'properties.name',
      'properties.email'
    ],
    include: [
      ['properties.username', { type: 'string', 'x-unique': true }]
    ],
    optional: [
      'properties.dateOfBirth'
    ]
  })
}}
```

#### Examples
---

Removing fields from the model:

```yaml
# model.yml

type: object
required:
  - id
properties:
  id:
    type: string
    format: uuid
  createdAt:
    type: string
    format: date-time
  updatedAt:
    type: string
    format: date-time
  name:
    type: string
  email:
    type: string
    format: email
  profilePicture:
    type: string
    format: uri
```

```yaml
# postModel.yml

{{
  extend('./model.yml', {
    omit: [
      'properties.id',
      'properties.createdAt',
      'properties.updatedAt'
    ]
  })
}}
```

Would output:
```yaml
type: object
properties:
  name:
    type: string
  email:
    type: string
    format: email
  profilePicture:
    type: string
    format: uri
```
---

Adding fields to the model:

```yaml
# model.yml

type: object
properties:
  name:
    type: string
  email:
    type: string
    format: email
  profilePicture:
    type: string
    format: uri
```

```yaml
# postModel.yml
{{
  extend('./model.yml', {
    include: [
      ['properties.password', { type: 'string', minLength: 32 }]
    ]
  })
}}
```

Would output:
```yaml
type: object
properties:
  name:
    type: string
  email:
    type: string
    format: email
  profilePicture:
    type: string
    format: uri
  password:
    type: string
    minLength: 32
```
---

Marking fields as required:

```yaml
# model.yml

type: object
properties:
  name:
    type: string
  email:
    type: string
    format: email
  profilePicture:
    type: string
    format: uri
```

```yaml
# postModel.yml

{{
  extend('./model.yml', {
    require: [
      'properties.email',
      'properties.name'
    ]
  })
}}
```

Would output:
```yaml
type: object
required:
  - name
  - email
properties:
  name:
    type: string
  email:
    type: string
    format: email
  profilePicture:
    type: string
    format: uri
```
---

Marking fields as optional:

```yaml
# model.yml

type: object
require:
  - name
  - email
  - profilePicture
properties:
  name:
    type: string
  email:
    type: string
    format: email
  profilePicture:
    type: string
    format: uri
```

```yaml
# postModel.yml

{{
  extend('./model.yml', {
    optional: [
      'properties.profilePicture'
    ]
  })
}}
```

Would output:
```yaml
type: object
required:
  - name
  - email
properties:
  name:
    type: string
  email:
    type: string
    format: email
  profilePicture:
    type: string
    format: uri
```
---

### [`database-entry`](./src/database-entry.ts)

Adds common DB fields to a model.

```yaml
type: object
properties:
  {{ databaseentry(<options>) }}
  otherProps:
    type: string
  # ...
```

#### Examples
---

With no params:

```yaml
# model.yml

type: object
properties:
  {{ databaseentry() }}
  name:
    type: string
  profilePicture:
    type: string
    format: uri
```

Would output:
```yaml
type: object
properties:
  id:
    type: string
    format: uuid
  createdAt:
    type: string
    format: date-time
  updatedAt:
    type: string
    format: date-time
  name:
    type: string
  profilePicture:
    type: string
```
---

To specifiy the id type:

```yaml
# model.yml

type: object
properties:
  {{ databaseentry({ id: 'string' }) }}
# {{ databaseentry({ id: 'number' }) }}
  name:
    type: string
  profilePicture:
    type: string
    format: uri
```

Would output:
```yaml
type: object
properties:
  id:
    type: string
#   type: number
  createdAt:
    type: string
    format: date-time
  updatedAt:
    type: string
    format: date-time
  name:
    type: string
  profilePicture:
    type: string
```

---

With softDeletion:

```yaml
# model.yml

type: object
properties:
  {{ databaseentry({ softDeletion: true }) }}
  name:
    type: string
  profilePicture:
    type: string
    format: uri
```

Would output:
```yaml
type: object
properties:
  id:
    type: string
    format: uuid
  createdAt:
    type: string
    format: date-time
  updatedAt:
    type: string
    format: date-time
  deletedAt:
    type: string
    format: date-time
  name:
    type: string
  profilePicture:
    type: string
```

### [`pagination`](./src/pagination.ts)

Adds a collection-type pagination model.

```yaml
{{ pagination(<path_or_options>) }}
```

#### Examples
---

With no params:

```yaml
# components/schemas/user/model.yml

type: object
properties:
  name:
    type: string
  numberOfDogs:
    type: number
```

```yaml
# components/schemas/user/models.yml

{{ pagination() }}
```

Would output:
```yaml
type: object
required:
  - meta
  - data
properties:
  meta:
    $ref: "#/components/schemas/Meta"
  data:
    type: array
    items: 
      $ref: "./model.yml"
```

---

To specify another model name:

```yaml
# components/schemas/user/singleUserResponse.yml

type: object
properties:
  name:
    type: string
  numberOfDogs:
    type: number
```

```yaml
# components/schemas/user/models.yml

{{ pagination({ path: "./singleUserResponse.yml" }) }}
```
or simply
```yaml
{{ pagination("./singleUserResponse.yml") }}
```

Would output:
```yaml
type: object
required:
  - meta
  - data
properties:
  meta:
    $ref: "#/components/schemas/Meta"
  data:
    type: array
    items: 
      $ref: "./singleUserResponse.yml"
```

---

To specify another pagination model:

```yaml
# components/schemas/user/singleUserResponse.yml

type: object
properties:
  name:
    type: string
  numberOfDogs:
    type: number
```

```yaml
# components/schemas/user/models.yml

{{ pagination({ paginationModel: "#/components/schemas/Pagination" }) }}
```

Would output:
```yaml
type: object
required:
  - meta
  - data
properties:
  meta:
    $ref: "#/components/schemas/Pagination"
  data:
    type: array
    items: 
      $ref: "./model.yml"
```

---

To alter or remove required fields:

```yaml
# components/schemas/user/singleUserResponse.yml

type: object
properties:
  name:
    type: string
  numberOfDogs:
    type: number
```

```yaml
# components/schemas/user/models.yml

{{ pagination({ required: ['meta'] }) }}
```

Would output:
```yaml
type: object
required:
  - meta
properties:
  meta:
    $ref: "#/components/schemas/Pagination"
  data:
    type: array
    items: 
      $ref: "./model.yml"
```

```yaml
# components/schemas/user/models.yml

{{ pagination({ required: [] }) }}
```

Would output:
```yaml
type: object
properties:
  meta:
    $ref: "#/components/schemas/Pagination"
  data:
    type: array
    items: 
      $ref: "./model.yml"
```
