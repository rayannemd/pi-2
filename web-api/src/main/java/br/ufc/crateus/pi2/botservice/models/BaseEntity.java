package br.ufc.crateus.pi2.botservice.models;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@MappedSuperclass
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public abstract class BaseEntity 
{
    @Column(name = "create_date", nullable = false, updatable = false)
    private Date createDate;

    @Column(name = "update_date", nullable = false)
    private Date updateDate;

    @Column(name = "delete_date")
    private Date deleteDate;

    @PrePersist
    protected void onCreate() {
        createDate = new Date();
        updateDate = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        updateDate = new Date();
    }

    public void softDelete() {
        deleteDate = new Date();
    }
}