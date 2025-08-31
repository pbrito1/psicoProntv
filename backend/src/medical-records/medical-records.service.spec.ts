import { Test, TestingModule } from '@nestjs/testing';
import { MedicalRecordsService } from './medical-records.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MedicalRecordsService', () => {
  let service: MedicalRecordsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalRecordsService,
        {
          provide: PrismaService,
          useValue: {
            medicalRecord: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              aggregate: jest.fn(),
            },
            client: {
              findUnique: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
            booking: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MedicalRecordsService>(MedicalRecordsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have create method', () => {
    expect(service.create).toBeDefined();
  });

  it('should have findAll method', () => {
    expect(service.findAll).toBeDefined();
  });

  it('should have findOne method', () => {
    expect(service.findOne).toBeDefined();
  });

  it('should have update method', () => {
    expect(service.update).toBeDefined();
  });

  it('should have remove method', () => {
    expect(service.remove).toBeDefined();
  });

  it('should have findByClient method', () => {
    expect(service.findByClient).toBeDefined();
  });

  it('should have findByTherapist method', () => {
    expect(service.findByTherapist).toBeDefined();
  });

  it('should have search method', () => {
    expect(service.search).toBeDefined();
  });
});
