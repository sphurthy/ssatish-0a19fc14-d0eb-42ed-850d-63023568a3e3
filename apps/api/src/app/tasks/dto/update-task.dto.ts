import { TaskCategory, TaskStatus } from '@task-mgmt/data';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  description?: string | null;

  @IsOptional()
  @IsEnum(TaskCategory)
  category?: TaskCategory;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
