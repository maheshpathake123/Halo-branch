import {Entity, model, property} from '@loopback/repository';

@model()
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  username: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  gender: string;

  @property({
    type: 'string',
    required: true,
  })
  relationshipStatus?: string;

  @property({
    type: 'string',
    required: true,
  })
  zipcode: string;

  @property({
    type: 'string',
    required: true,
  })
  country: string;

  //array of string for categories
  @property({
    type: 'array',
    itemType: 'string',
    required: true,
  })
  categories: string[];

  @property({
    type: 'boolean',
    required: true,
  })
  isActive: boolean;

  @property({
    type: 'boolean',
    required: true,
  })
  isDeleted: boolean;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      dataType: "bigint"
    }
  })
  createdAt: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      dataType: "bigint"
    }
  })
  updatedAt: number;

  @property({
    type: 'number',
    postgresql: {
      dataType: "bigint"
    }
  })
  deletedAt: number;


  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
