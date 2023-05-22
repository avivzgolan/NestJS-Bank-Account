import { PipeTransform, Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, ObjectId> {
  /*
    This pipe parses a string into a mongodb ObjectId

    Parameters:
      id
        A string id

    Returns:
      id
        A mongodb ObjectId

    Raises:
      500 if the conversion is unsuccessful
  */
  transform(id: string) {
    return new ObjectId(id);
  }
}
