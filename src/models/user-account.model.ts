import {Entity, model, property} from '@loopback/repository';

@model()
export class UserAccount extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  userId: string;

  @property({
    type: 'string',
    required: true,
  })
  loginId: string;

  @property({
    type: 'string',
  })
  password?: string;

  @property({
    type: 'string',
    required: true,
  })
  accountType: string;

  @property({
    type: 'boolean',
    required: true,
  })
  accountVerified: boolean;

  @property({
    type: 'string',
  })
  otp?: string;

  @property({
    type: 'number',
    postgresql: {
      dataType: "bigint"
    }
  })
  otpExpiry?: number;

  @property({
    type: 'boolean',
    required: true,
  })
  isActive: boolean;

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
  isDeleted: boolean;

  @property({
    type: 'number',
    postgresql: {
      dataType: "bigint"
    }
  })
  deletedAt: number;

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
    required: true,
    postgresql: {
      dataType: "bigint"
    }
  })
  createdAt: number;


  constructor(data?: Partial<UserAccount>) {
    super(data);
  }
}

export interface UserAccountRelations {
  // describe navigational properties here
}

export type UserAccountWithRelations = UserAccount & UserAccountRelations;
