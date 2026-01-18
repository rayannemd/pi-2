package br.ufc.crateus.pi2.botservice.models;

import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import br.ufc.crateus.pi2.botservice.models.enums.EUserType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseEntity
{
    @Id
    @Column(unique = true)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String email;

    @JsonIgnore
    private String password;

    @Column(unique = true)
    private String cpf_cnpj;

    private EUserType type;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private Address address;

    @ManyToMany
    @JoinTable(
        name = "user_service",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "service_id")
    )
    private Set<Service> services = new HashSet<>();

    public void updateAddress(Address newAddress) 
    {
        this.address.setStreet(newAddress.getStreet());
        this.address.setNumber(newAddress.getNumber());
        this.address.setNeighborhood(newAddress.getNeighborhood());
        this.address.setCity(newAddress.getCity());
        this.address.setState(newAddress.getState());
        this.address.setZipCode(newAddress.getZipCode());
    }

    public void addService(Service service) 
    {
        this.services.add(service);
        service.getUsers().add(this);
    }
}
