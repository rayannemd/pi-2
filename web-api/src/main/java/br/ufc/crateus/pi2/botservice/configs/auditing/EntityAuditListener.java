package br.ufc.crateus.pi2.botservice.configs.auditing;

import jakarta.persistence.PrePersist;
import jakarta.persistence.PreRemove;
import jakarta.persistence.PreUpdate;
import br.ufc.crateus.pi2.botservice.models.BaseEntity;

import java.util.Date;

public class EntityAuditListener 
{
    @PrePersist
    public void prePersist(BaseEntity entity) {
        Date now = new Date();
        entity.setCreateDate(now);
        entity.setUpdateDate(now);
    }

    @PreUpdate
    public void preUpdate(BaseEntity entity) {
        entity.setUpdateDate(new Date());
    }

    @PreRemove
    public void preRemove(BaseEntity entity) {
        entity.setDeleteDate(new Date());
    }
}