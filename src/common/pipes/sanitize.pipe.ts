import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
const sanitizeHtml = require('sanitize-html');

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      return sanitizeHtml(value);
    }
    if (typeof value === 'object' && value !== null) {
      Object.keys(value).forEach(key => {
        if (typeof value[key] === 'string') {
          value[key] = sanitizeHtml(value[key]);
        }
      });
    }
    return value;
  }
}