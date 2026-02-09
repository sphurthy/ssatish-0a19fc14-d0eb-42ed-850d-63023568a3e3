import { TaskCategory, TaskStatus } from '@task-mgmt/data';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  title: string;

  @IsOptional()
  description?: string;

  @IsEnum(TaskCategory)
  category: TaskCategory;

  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
