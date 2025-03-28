// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DecentralizedFreelanceMarket {
    enum ProjectStatus { Active, Ongoing, Completed, OnDispute, Rejected, Done_by_freelancer }
    enum UserType { Freelancer, Client }

    struct User {
        address wallet;
        UserType userType;
        string name;
        string description;
        string email;
        uint256 credits;
        string[] skills;
        string[] documents; // Array of IPFS CIDs for freelancer documents/demos
        uint256[] reviews; // Ratings given by clients
    }

    struct Project {
        uint256 id;
        address client;
        string title;
        string description;
        uint256 budget;
        ProjectStatus status;
        string demo; // IPFS CID provided when freelancer marks project as done
        address freelancer;
    }

    struct Dispute {
        uint256 projectId;
        address raisedBy;
        address raisedAgainst;
        string explanation;
        uint256 votesFor;
        uint256 votesAgainst;
        bool resolved;
        uint256 creationTime; // Added timestamp for dispute creation
    }

    mapping(address => User) public users;
    mapping(uint256 => Project) public projects;
    mapping(uint256 => Dispute) public disputes;
    mapping(uint256 => address[]) public Applied; // project id to list of freelancer applicants
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // New mappings for efficient per-user project lookups.
    mapping(address => uint256[]) public clientProjects;
    mapping(address => uint256[]) public freelancerProjects;

    uint256 public projectCounter;
    uint256 public disputeCounter;
    uint256 public constant DISPUTE_LIFETIME = 1 minutes; // Dispute lifetime in seconds

    event UserRegistered(address indexed wallet, UserType userType);
    event ProfileUpdated(address indexed wallet);
    event ProjectCreated(uint256 indexed projectId, address indexed client);
    event ProjectApplied(uint256 indexed projectId, address indexed freelancer);
    event ProjectAccepted(uint256 indexed projectId, address indexed freelancer);
    event ProjectCompleted(uint256 indexed projectId);
    event ProjectApproved(uint256 indexed projectId);
    event DisputeRaised(uint256 indexed disputeId, uint256 indexed projectId);
    event DisputeVoted(uint256 indexed disputeId, address indexed voter, bool vote);
    event DisputeResolved(uint256 indexed disputeId, bool clientWins);
    event FundsTransferredToEscrow(uint256 indexed projectId, uint256 amount);
    event FundsTransferredFromEscrow(uint256 indexed projectId, address indexed recipient, uint256 amount);

    // Modifiers
    modifier onlyRegistered() {
        require(users[msg.sender].wallet != address(0), "User not registered");
        _;
    }

    modifier onlyClient(uint256 projectId) {
        require(projects[projectId].client == msg.sender, "Only client can perform this action");
        _;
    }

    modifier onlyFreelancer(uint256 projectId) {
        require(projects[projectId].freelancer == msg.sender, "Only freelancer can perform this action");
        _;
    }

    modifier onlyActiveProject(uint256 projectId) {
        require(projects[projectId].status == ProjectStatus.Active, "Project is not active");
        _;
    }

    modifier onlyOngoingProject(uint256 projectId) {
        require(projects[projectId].status == ProjectStatus.Ongoing, "Project is not ongoing");
        _;
    }

    // New modifier to allow for both ongoing and done_by_freelancer statuses
    modifier onlyApprovableProject(uint256 projectId) {
        require(
            projects[projectId].status == ProjectStatus.Ongoing || 
            projects[projectId].status == ProjectStatus.Done_by_freelancer, 
            "Project is not in approvable state"
        );
        _;
    }

    modifier checkDisputeLifetime(uint256 disputeId) {
        Dispute storage dispute = disputes[disputeId];
        if (!dispute.resolved && block.timestamp >= dispute.creationTime + DISPUTE_LIFETIME) {
            resolveDisputeInternal(disputeId);
        }
        _;
    }

    function registerUser(UserType userType, string memory name, string memory email) external {
        require(users[msg.sender].wallet == address(0), "User already registered");
        users[msg.sender] = User({
            wallet: msg.sender,
            userType: userType,
            name: name,
            description: "",
            email: email,
            credits: 0,
            skills: new string[](0),
            documents: new string[](0),
            reviews: new uint256[](0)
        });
        emit UserRegistered(msg.sender, userType);
    }

    function getProfile(address account) external view onlyRegistered returns (
        string memory name, 
        string memory description, 
        string memory email, 
        string[] memory skills, 
        string[] memory documents,
        uint256 credits,
        uint256[] memory reviews,
        UserType userType
    ) {
        User storage user = users[account];
        return (
            user.name,
            user.description,
            user.email,
            user.skills,
            user.documents,
            user.credits,
            user.reviews,
            user.userType
        );
    }

    function updateProfile(
        string memory name, 
        string memory description, 
        string memory email, 
        string[] memory skills, 
        string[] memory documents
    ) external onlyRegistered {
        User storage user = users[msg.sender];
        user.name = name;
        user.description = description;
        user.email = email;
        if (user.userType == UserType.Freelancer) {
            user.skills = skills;
            user.documents = documents;
        }
        emit ProfileUpdated(msg.sender);
    }
    
    function createProject(string memory title, string memory description, uint256 budget) external onlyRegistered {
        require(users[msg.sender].userType == UserType.Client, "Only clients can create projects");
        projectCounter++;
        projects[projectCounter] = Project({
            id: projectCounter,
            client: msg.sender,
            title: title,
            description: description,
            demo: "",
            budget: budget,
            status: ProjectStatus.Active,
            freelancer: address(0)
        });
        clientProjects[msg.sender].push(projectCounter);
        emit ProjectCreated(projectCounter, msg.sender);
    }

    function applyProject(uint256 projectId) external onlyRegistered onlyActiveProject(projectId) {
        require(users[msg.sender].userType == UserType.Freelancer, "Only freelancers can apply");
        for (uint256 i = 0; i < Applied[projectId].length; i++) {
            require(Applied[projectId][i] != msg.sender, "Freelancer already applied");
        }
        Applied[projectId].push(msg.sender);
        emit ProjectApplied(projectId, msg.sender);
    }

    function acceptProjectRequest(uint256 projectId, address _freelancer) 
        external 
        onlyClient(projectId) 
        onlyActiveProject(projectId) 
    {
        projects[projectId].freelancer = _freelancer;
        projects[projectId].status = ProjectStatus.Ongoing;
        freelancerProjects[_freelancer].push(projectId);
        emit ProjectAccepted(projectId, _freelancer);
    }

    function projectDone(uint256 projectId, string memory cid) external onlyFreelancer(projectId) onlyOngoingProject(projectId) {
        projects[projectId].status = ProjectStatus.Done_by_freelancer;
        projects[projectId].demo = cid;
        emit ProjectCompleted(projectId);
    }

    // Updated to use onlyApprovableProject modifier and include fund transfer
    function projectApprove(uint256 projectId, uint256 rating) external onlyClient(projectId) onlyApprovableProject(projectId) {
        projects[projectId].status = ProjectStatus.Completed;
        users[projects[projectId].client].credits += 10;
        users[projects[projectId].freelancer].credits += 10;
        users[projects[projectId].freelancer].reviews.push(rating);
        
        // Transfer funds to freelancer upon approval
        payable(projects[projectId].freelancer).transfer(projects[projectId].budget);
        emit FundsTransferredFromEscrow(projectId, projects[projectId].freelancer, projects[projectId].budget);
        
        emit ProjectApproved(projectId);
    }

    function raiseDispute(uint256 projectId, string memory explanation) external {
        require(
            projects[projectId].status == ProjectStatus.Ongoing || 
            projects[projectId].status == ProjectStatus.Done_by_freelancer,
            "Project must be ongoing or marked as done by freelancer"
        );
        require(
            projects[projectId].client == msg.sender || projects[projectId].freelancer == msg.sender,
            "Only client or freelancer can raise dispute"
        );
        disputeCounter++;
        disputes[disputeCounter] = Dispute({
            projectId: projectId,
            raisedBy: msg.sender,
            raisedAgainst: (msg.sender == projects[projectId].client) ? projects[projectId].freelancer : projects[projectId].client,
            explanation: explanation,
            votesFor: 0,
            votesAgainst: 0,
            resolved: false,
            creationTime: block.timestamp // Set creation time to current timestamp
        });
        projects[projectId].status = ProjectStatus.OnDispute;
        emit DisputeRaised(disputeCounter, projectId);
    }

    function voteDispute(uint256 disputeId, bool vote) external onlyRegistered checkDisputeLifetime(disputeId) {
        require(!disputes[disputeId].resolved, "Dispute already resolved");
        require(!hasVoted[disputeId][msg.sender], "Already voted");
        uint256 creditWeight = users[msg.sender].credits / 10; // 1 credit = 0.1 vote weight (integer division)
        if (vote) {
            disputes[disputeId].votesFor += creditWeight;
        } else {
            disputes[disputeId].votesAgainst += creditWeight;
        }
        hasVoted[disputeId][msg.sender] = true;
        emit DisputeVoted(disputeId, msg.sender, vote);
    }

    // Function to check if dispute lifetime has expired and resolve if needed
    function checkDisputeExpiry(uint256 disputeId) external checkDisputeLifetime(disputeId) {
        // All logic is in the modifier
    }

    // Internal function to handle dispute resolution logic
    function resolveDisputeInternal(uint256 disputeId) internal {
        Dispute storage dispute = disputes[disputeId];
        if (dispute.resolved) return; // Skip if already resolved
        
        Project storage project = projects[dispute.projectId];

        bool clientWins;
        if (dispute.votesFor > dispute.votesAgainst) {
            if (users[dispute.raisedBy].userType == UserType.Client) {
                project.status = ProjectStatus.Rejected;
                clientWins = true;
            } else {
                project.status = ProjectStatus.Completed;
                clientWins = false;
            }
        } else {
            if (users[dispute.raisedBy].userType == UserType.Client) {
                project.status = ProjectStatus.Completed;
                clientWins = false;
            } else {
                project.status = ProjectStatus.Rejected;
                clientWins = true;
            }
        }
        
        dispute.resolved = true;
        emit DisputeResolved(disputeId, clientWins);
        
        // Automatically transfer funds based on the resolution
        if (project.status == ProjectStatus.Completed) {
            payable(project.freelancer).transfer(project.budget);
            emit FundsTransferredFromEscrow(dispute.projectId, project.freelancer, project.budget);
        } else {
            payable(project.client).transfer(project.budget);
            emit FundsTransferredFromEscrow(dispute.projectId, project.client, project.budget);
        }
    }

    // Public function that anyone can call to resolve a dispute
    function resolveDispute(uint256 disputeId) external checkDisputeLifetime(disputeId) {
        require(!disputes[disputeId].resolved, "Dispute already resolved");
        resolveDisputeInternal(disputeId);
    }

    function getDisputeTimeRemaining(uint256 disputeId) external view returns (uint256) {
        Dispute storage dispute = disputes[disputeId];
        if (dispute.resolved) {
            return 0;
        }
        uint256 endTime = dispute.creationTime + DISPUTE_LIFETIME;
        if (block.timestamp >= endTime) {
            return 0;
        }
        return endTime - block.timestamp;
    }

    function getFreelancerProjectsByStatus(ProjectStatus status) external view returns (Project[] memory) {
        uint256[] storage projIds = freelancerProjects[msg.sender];
        uint256 count = 0;
        for (uint256 i = 0; i < projIds.length; i++) {
            if (projects[projIds[i]].status == status) {
                count++;
            }
        }
        Project[] memory result = new Project[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < projIds.length; i++) {
            if (projects[projIds[i]].status == status) {
                result[index] = projects[projIds[i]];
                index++;
            }
        }
        return result;
    }

    function getClientProjectsByStatus(ProjectStatus status) external view returns (Project[] memory) {
        uint256[] storage projIds = clientProjects[msg.sender];
        uint256 count = 0;
        for (uint256 i = 0; i < projIds.length; i++) {
            if (projects[projIds[i]].status == status) {
                count++;
            }
        }
        Project[] memory result = new Project[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < projIds.length; i++) {
            if (projects[projIds[i]].status == status) {
                result[index] = projects[projIds[i]];
                index++;
            }
        }
        return result;
    }

    function transferToEscrow(uint256 projectId) external payable onlyClient(projectId) onlyOngoingProject(projectId) {
        require(msg.value == projects[projectId].budget, "Incorrect amount sent");
        emit FundsTransferredToEscrow(projectId, msg.value);
    }

    function transferFromEscrow(uint256 projectId) external {
        Project storage project = projects[projectId];
        require(
            project.status == ProjectStatus.Completed || project.status == ProjectStatus.Rejected,
            "Project not in final state"
        );
        if (project.status == ProjectStatus.Completed) {
            payable(project.freelancer).transfer(project.budget);
            emit FundsTransferredFromEscrow(projectId, project.freelancer, project.budget);
        } else {
            payable(project.client).transfer(project.budget);
            emit FundsTransferredFromEscrow(projectId, project.client, project.budget);
        }
    }

    function getFreelancerApplied(uint256 projectId) external view onlyRegistered onlyActiveProject(projectId) returns (address[] memory addresses) {
        return Applied[projectId];
    }
}