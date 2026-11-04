package com.taihexing.homeservice.model;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.List;

@Entity
@Table(name = "providers")
public class Provider {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String name; private String avatar; private Integer creditScore; private String status;
    @ElementCollection private List<String> skills;
    private Integer completedOrders;
    protected Provider() {}
    public Provider(Long id,String name,String avatar,Integer creditScore,String status,List<String> skills,Integer completedOrders){this.id=id;this.name=name;this.avatar=avatar;this.creditScore=creditScore;this.status=status;this.skills=skills;this.completedOrders=completedOrders;}
    public Long getId(){return id;} public String getName(){return name;} public String getAvatar(){return avatar;} public Integer getCreditScore(){return creditScore;} public String getStatus(){return status;} public List<String> getSkills(){return skills;} public Integer getCompletedOrders(){return completedOrders;}
}
