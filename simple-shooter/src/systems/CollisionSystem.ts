import { Enemy } from "../entities/Enemy";
import { Player } from "../entities/Player";
import { Projectile } from "../entities/Projectile";

export class CollisionSystem {
  checkProjectileEnemyCollisions(
    projectiles: Projectile[],
    enemies: Enemy[]
  ): void {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const projectile = projectiles[i];

      if (projectile.owner !== "player") continue;

      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j];
        const distance = projectile.mesh.position.distanceTo(enemy.position);

        if (distance < enemy.collisionRadius) {
          const isDead = enemy.takeDamage(projectile.damage);
          projectile.markForDestroy();

          if (isDead) {
            enemy.markForDestroy();
          }
          break;
        }
      }
    }
  }

  checkProjectilePlayerCollisions(
    projectiles: Projectile[],
    player: Player
  ): void {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const projectile = projectiles[i];

      if (projectile.owner !== "enemy") continue;

      const distance = projectile.mesh.position.distanceTo(player.position);

      if (distance < player.collisionRadius) {
        player.takeDamage(projectile.damage);
        projectile.markForDestroy();
      }
    }
  }
}
