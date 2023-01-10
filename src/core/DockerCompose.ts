import { join } from 'path';
import * as yaml from 'yaml';
import { writeFileSync } from 'fs';

import { execute } from '../helpers/spawn';
import { getConfig } from './GluestackConfig';
import { removeSpecialChars } from '../helpers/remove-special-chars';

import { IStatelessPlugin } from './types/IStatelessPlugin';
import { IDockerCompose, IService } from './types/IDockerCompose';

/**
 * Docker Compose
 *
 * This class is responsible for generating the docker-compose.yml file
 * in your backend instance's engine/router folder.
 */
export default class DockerCompose implements IDockerCompose {
  public version: string = '3.9';
  public services: { [key: string]: IService };

  constructor() {
    this.services = {};
  }

  // Converts the docker-compose json data to YAML
  public toYAML() {
    return yaml.stringify({
      version: this.version,
      services: this.services
    });
  }

  // Adds a service to the docker-compose file
  public addService(name: string, service: IService) {
    this.services[removeSpecialChars(name)] = service;
  }

  // Generates the docker-compose file
  public async generate() {
    writeFileSync(
      join(
        process.cwd(),
        getConfig('backendInstancePath'),
        'engine/router',
        'docker-compose.yml'
      ),
      this.toYAML()
    );
  }

  // Adds the nginx service to the docker-compose file
  public async addNginx(plugin: IStatelessPlugin) {
    const nginx = {
      container_name: 'nginx',
      restart: 'always',
      build: join(plugin.path, 'router'),
      ports: [
        '9090:80'
      ],
      volumes: [
        `${join(plugin.path, 'router', 'nginx.conf')}:/etc/nginx/nginx.conf`
      ]
    };

    this.addService('nginx', nginx);
  }

  // Adds the hasura service to the docker-compose file
  public async addHasura(plugin: IStatelessPlugin) {
    const hasura: IService = {
      container_name: plugin.instance,
      restart: 'always',
      image: 'hasura/graphql-engine:v2.16.1',
      ports: [
        '8080:8080'
      ],
      volumes: [
        `${plugin.path}:/hasura`,
      ],
      env_file: [
        `${plugin.path}/.env`
      ]
    };

    this.addService(plugin.instance, hasura);
  }

  // Adds the other services to the docker-compose file
  public async addOthers(plugin: IStatelessPlugin) {
    const name: string = plugin.instance;

    const service: IService = {
      container_name: removeSpecialChars(plugin.instance),
      restart: 'always',
      build: plugin.path,
      volumes: [
        `${plugin.path}:/server`,
        `/server/node_modules`
      ],
      env_file: [
        `${plugin.path}/.env`
      ]
    };

    this.addService(name, service);
  }

  // Executes the docker-compose cli
  public async start(projectName: string, filepath: string) {
    await execute('docker-compose', [
      '-p',
      projectName,
      'up',
      '--remove-orphans',
      '-d'
    ], {
      cwd: filepath,
      stdio: 'inherit'
    });
  }

  public async stop(projectName: string, filepath: string) {
    await execute('docker-compose', [
      '-p',
      projectName,
      'down',
      '--volumes'
    ], {
      cwd: filepath,
      stdio: 'inherit'
    });
  }
}
