import SpriteKit

class GameScene: SKScene, SKPhysicsContactDelegate {

    // MARK: - Physics Categories
    private let catBird:   UInt32 = 0b0001
    private let catPipe:   UInt32 = 0b0010
    private let catGround: UInt32 = 0b0100
    private let catScore:  UInt32 = 0b1000

    // MARK: - Game State
    private enum State { case idle, playing, dead }
    private var state: State = .idle

    // MARK: - Nodes
    private var bird: SKShapeNode!
    private var scoreLabel: SKLabelNode!
    private var scoreShadow: SKLabelNode!
    private var gameOverPanel: SKNode!

    // MARK: - Score
    private var score = 0
    private var bestScore = 0

    // Deferred flag — safe to modify physics from update(), not didBegin()
    private var pendingDeath = false

    private let groundH: CGFloat = 100

    // MARK: - Scene Setup

    override func didMove(to view: SKView) {
        physicsWorld.gravity = CGVector(dx: 0, dy: -10)
        physicsWorld.contactDelegate = self

        buildBackground()
        buildGround()
        buildBird()
        buildHUD()
        buildGameOverPanel()
        enterIdle()
    }

    // MARK: - Background & Ground

    private func buildBackground() {
        backgroundColor = SKColor(red: 0.53, green: 0.81, blue: 0.98, alpha: 1)

        // Decorative clouds
        let offsets: [(CGFloat, CGFloat)] = [(60, 0.78), (220, 0.72), (380, 0.82)]
        for (x, yRatio) in offsets {
            let cloud = makeCloud()
            cloud.position = CGPoint(x: x, y: size.height * yRatio)
            addChild(cloud)
        }
    }

    private func makeCloud() -> SKShapeNode {
        let path = CGMutablePath()
        path.addEllipse(in: CGRect(x: 0, y: 0, width: 90, height: 38))
        path.addEllipse(in: CGRect(x: 25, y: 14, width: 65, height: 30))
        path.addEllipse(in: CGRect(x: 58, y: 8, width: 52, height: 28))
        let node = SKShapeNode(path: path)
        node.fillColor = SKColor(white: 1, alpha: 0.85)
        node.strokeColor = .clear
        node.zPosition = -1
        return node
    }

    private func buildGround() {
        // Visual ground
        let ground = SKShapeNode(rectOf: CGSize(width: size.width + 20, height: groundH))
        ground.fillColor = SKColor(red: 0.36, green: 0.60, blue: 0.15, alpha: 1)
        ground.strokeColor = .clear
        ground.position = CGPoint(x: size.width / 2, y: groundH / 2)
        ground.zPosition = 5

        let gpb = SKPhysicsBody(rectangleOf: CGSize(width: size.width + 20, height: groundH))
        gpb.isDynamic = false
        gpb.categoryBitMask    = catGround
        gpb.contactTestBitMask = catBird
        gpb.collisionBitMask   = catBird
        ground.physicsBody = gpb
        addChild(ground)

        // Top stripe on ground (lighter green)
        let stripe = SKShapeNode(rectOf: CGSize(width: size.width + 20, height: 14))
        stripe.fillColor = SKColor(red: 0.50, green: 0.78, blue: 0.20, alpha: 1)
        stripe.strokeColor = .clear
        stripe.position = CGPoint(x: size.width / 2, y: groundH + 7)
        stripe.zPosition = 6
        addChild(stripe)

        // Invisible ceiling
        let ceiling = SKNode()
        ceiling.position = CGPoint(x: size.width / 2, y: size.height + 5)
        let cpb = SKPhysicsBody(rectangleOf: CGSize(width: size.width, height: 10))
        cpb.isDynamic = false
        cpb.categoryBitMask    = catGround
        cpb.contactTestBitMask = catBird
        cpb.collisionBitMask   = catBird
        ceiling.physicsBody = cpb
        addChild(ceiling)
    }

    // MARK: - Bird

    private func buildBird() {
        let r: CGFloat = 20
        bird = SKShapeNode(circleOfRadius: r)
        bird.fillColor  = SKColor(red: 1.00, green: 0.87, blue: 0.10, alpha: 1)
        bird.strokeColor = SKColor(red: 0.90, green: 0.50, blue: 0.00, alpha: 1)
        bird.lineWidth  = 2.5
        bird.zPosition  = 10
        bird.position   = CGPoint(x: size.width * 0.28, y: size.height * 0.55)

        // Eye white
        let eyeWhite = SKShapeNode(circleOfRadius: 6.5)
        eyeWhite.fillColor  = .white
        eyeWhite.strokeColor = .clear
        eyeWhite.position   = CGPoint(x: 8, y: 7)
        bird.addChild(eyeWhite)

        // Pupil
        let pupil = SKShapeNode(circleOfRadius: 3.5)
        pupil.fillColor  = .black
        pupil.strokeColor = .clear
        pupil.position   = CGPoint(x: 9, y: 6)
        bird.addChild(pupil)

        // Beak
        let beakPath = CGMutablePath()
        beakPath.move(to: CGPoint(x: 16, y: 4))
        beakPath.addLine(to: CGPoint(x: 28, y: 0))
        beakPath.addLine(to: CGPoint(x: 16, y: -4))
        beakPath.closeSubpath()
        let beak = SKShapeNode(path: beakPath)
        beak.fillColor  = SKColor(red: 1, green: 0.55, blue: 0, alpha: 1)
        beak.strokeColor = .clear
        bird.addChild(beak)

        // Physics — only collide with ground; pipes trigger contact only
        let pb = SKPhysicsBody(circleOfRadius: r - 3)
        pb.isDynamic          = false
        pb.restitution        = 0
        pb.linearDamping      = 0
        pb.allowsRotation     = true
        pb.categoryBitMask    = catBird
        pb.contactTestBitMask = catPipe | catGround | catScore
        pb.collisionBitMask   = catGround
        bird.physicsBody = pb

        addChild(bird)
    }

    // MARK: - HUD

    private func buildHUD() {
        // Shadow first (rendered behind)
        scoreShadow = SKLabelNode(fontNamed: "AvenirNext-Heavy")
        scoreShadow.fontSize  = 56
        scoreShadow.fontColor = SKColor(white: 0, alpha: 0.30)
        scoreShadow.horizontalAlignmentMode = .center
        scoreShadow.position  = CGPoint(x: size.width / 2 + 2, y: size.height - 115)
        scoreShadow.zPosition = 19
        scoreShadow.text = "0"
        addChild(scoreShadow)

        scoreLabel = SKLabelNode(fontNamed: "AvenirNext-Heavy")
        scoreLabel.fontSize  = 56
        scoreLabel.fontColor = .white
        scoreLabel.horizontalAlignmentMode = .center
        scoreLabel.position  = CGPoint(x: size.width / 2, y: size.height - 115)
        scoreLabel.zPosition = 20
        scoreLabel.text = "0"
        addChild(scoreLabel)
    }

    // MARK: - Game Over Panel

    private func buildGameOverPanel() {
        gameOverPanel = SKNode()
        gameOverPanel.zPosition = 30
        gameOverPanel.isHidden  = true
        gameOverPanel.alpha     = 0

        let panel = SKShapeNode(rectOf: CGSize(width: size.width * 0.78, height: 210),
                                cornerRadius: 22)
        panel.fillColor  = SKColor(white: 0, alpha: 0.68)
        panel.strokeColor = SKColor(white: 1, alpha: 0.15)
        panel.lineWidth  = 1.5
        panel.position   = CGPoint(x: size.width / 2, y: size.height / 2)
        gameOverPanel.addChild(panel)

        let title = SKLabelNode(fontNamed: "AvenirNext-Heavy")
        title.text     = "GAME OVER"
        title.fontSize = 36
        title.fontColor = .white
        title.position  = CGPoint(x: size.width / 2, y: size.height / 2 + 60)
        gameOverPanel.addChild(title)

        let panelScore = SKLabelNode(fontNamed: "AvenirNext-Medium")
        panelScore.name     = "panelScore"
        panelScore.fontSize = 26
        panelScore.fontColor = SKColor(red: 1, green: 0.87, blue: 0.10, alpha: 1)
        panelScore.position  = CGPoint(x: size.width / 2, y: size.height / 2 + 12)
        gameOverPanel.addChild(panelScore)

        let panelBest = SKLabelNode(fontNamed: "AvenirNext-Medium")
        panelBest.name     = "panelBest"
        panelBest.fontSize = 20
        panelBest.fontColor = SKColor(white: 0.80, alpha: 1)
        panelBest.position  = CGPoint(x: size.width / 2, y: size.height / 2 - 18)
        gameOverPanel.addChild(panelBest)

        let restart = SKLabelNode(fontNamed: "AvenirNext-Medium")
        restart.text     = "Tap to Restart"
        restart.fontSize = 20
        restart.fontColor = SKColor(white: 0.90, alpha: 1)
        restart.position  = CGPoint(x: size.width / 2, y: size.height / 2 - 65)
        restart.run(SKAction.repeatForever(SKAction.sequence([
            SKAction.fadeAlpha(to: 0.35, duration: 0.65),
            SKAction.fadeAlpha(to: 1.00, duration: 0.65)
        ])))
        gameOverPanel.addChild(restart)

        addChild(gameOverPanel)
    }

    // MARK: - State Machine

    private func enterIdle() {
        state = .idle
        setScore(0)

        bird.physicsBody?.isDynamic = false
        bird.zRotation = 0
        bird.removeAction(forKey: "bob")
        bird.run(SKAction.repeatForever(SKAction.sequence([
            SKAction.moveBy(x: 0, y: 13, duration: 0.55),
            SKAction.moveBy(x: 0, y: -13, duration: 0.55)
        ])), withKey: "bob")

        addTapHint("Tap to Play")
    }

    private func addTapHint(_ text: String) {
        childNode(withName: "tapHint")?.removeFromParent()
        let hint = SKLabelNode(fontNamed: "AvenirNext-Medium")
        hint.name     = "tapHint"
        hint.text     = text
        hint.fontSize = 26
        hint.fontColor = .white
        hint.position  = CGPoint(x: size.width / 2, y: size.height * 0.40)
        hint.zPosition = 20
        hint.run(SKAction.repeatForever(SKAction.sequence([
            SKAction.fadeAlpha(to: 0.40, duration: 0.70),
            SKAction.fadeAlpha(to: 1.00, duration: 0.70)
        ])))
        addChild(hint)
    }

    private func startGame() {
        state = .playing
        childNode(withName: "tapHint")?.removeFromParent()

        bird.removeAction(forKey: "bob")
        bird.physicsBody?.isDynamic = true

        gameOverPanel.isHidden = true
        gameOverPanel.alpha    = 0

        cleanPipes()
        flap()

        run(SKAction.repeatForever(SKAction.sequence([
            SKAction.run { [weak self] in self?.spawnPipePair() },
            SKAction.wait(forDuration: 2.2)
        ])), withKey: "spawnPipes")
    }

    private func flap() {
        guard state == .playing else { return }
        bird.physicsBody?.velocity = .zero
        bird.physicsBody?.applyImpulse(CGVector(dx: 0, dy: 52))
    }

    private func triggerDeath() {
        guard state == .playing else { return }
        state = .dead

        removeAction(forKey: "spawnPipes")
        enumerateChildNodes(withName: "pipe")   { $0.removeAllActions() }
        enumerateChildNodes(withName: "scorer") { $0.removeAllActions() }

        let flash = SKAction.sequence([
            SKAction.colorize(with: .red, colorBlendFactor: 1, duration: 0.07),
            SKAction.colorize(withColorBlendFactor: 0, duration: 0.07)
        ])
        bird.run(SKAction.sequence([
            SKAction.repeat(flash, count: 4),
            SKAction.run { [weak self] in self?.showGameOverPanel() }
        ]))
    }

    private func showGameOverPanel() {
        if score > bestScore { bestScore = score }

        (gameOverPanel.childNode(withName: "panelScore") as? SKLabelNode)?.text = "Score: \(score)"
        (gameOverPanel.childNode(withName: "panelBest")  as? SKLabelNode)?.text = "Best:   \(bestScore)"

        gameOverPanel.isHidden = false
        gameOverPanel.run(SKAction.fadeIn(withDuration: 0.30))
    }

    // MARK: - Pipes

    private func spawnPipePair() {
        let pipeW: CGFloat = 68
        let gap:   CGFloat = 158
        let minCenter = groundH + gap / 2 + 45
        let maxCenter = size.height - gap / 2 - 90
        let center    = CGFloat.random(in: minCenter...maxCenter)

        let speed: CGFloat   = 170
        let dist:  CGFloat   = size.width + pipeW + 30
        let dur:   TimeInterval = TimeInterval(dist / speed)

        let startX = size.width + pipeW / 2 + 10

        // Bottom pipe
        let bH = center - gap / 2 - groundH
        let bottom = makePipe(width: pipeW, height: bH, capOnTop: true)
        bottom.position = CGPoint(x: startX, y: groundH + bH / 2)
        bottom.run(moveAction(dist: dist, duration: dur))
        addChild(bottom)

        // Top pipe
        let tH = size.height - (center + gap / 2)
        let top = makePipe(width: pipeW, height: tH, capOnTop: false)
        top.position = CGPoint(x: startX, y: size.height - tH / 2)
        top.run(moveAction(dist: dist, duration: dur))
        addChild(top)

        // Score sensor (thin, invisible, moves with pipes)
        let scorer = SKNode()
        scorer.name     = "scorer"
        scorer.position = CGPoint(x: startX, y: center)
        let spb = SKPhysicsBody(rectangleOf: CGSize(width: 4, height: gap))
        spb.isDynamic          = false
        spb.categoryBitMask    = catScore
        spb.contactTestBitMask = catBird
        spb.collisionBitMask   = 0
        scorer.physicsBody = spb
        scorer.run(moveAction(dist: dist, duration: dur))
        addChild(scorer)
    }

    private func moveAction(dist: CGFloat, duration: TimeInterval) -> SKAction {
        SKAction.sequence([
            SKAction.moveBy(x: -dist, y: 0, duration: duration),
            SKAction.removeFromParent()
        ])
    }

    private func makePipe(width: CGFloat, height: CGFloat, capOnTop: Bool) -> SKNode {
        let node = SKNode()
        node.name = "pipe"

        // Body
        let body = SKShapeNode(rectOf: CGSize(width: width, height: height))
        body.fillColor   = SKColor(red: 0.12, green: 0.55, blue: 0.12, alpha: 1)
        body.strokeColor = SKColor(red: 0.04, green: 0.28, blue: 0.04, alpha: 1)
        body.lineWidth   = 2
        node.addChild(body)

        // Cap (wider end piece)
        let capH: CGFloat = 28
        let cap = SKShapeNode(rectOf: CGSize(width: width + 16, height: capH), cornerRadius: 5)
        cap.fillColor   = SKColor(red: 0.16, green: 0.68, blue: 0.16, alpha: 1)
        cap.strokeColor = SKColor(red: 0.04, green: 0.28, blue: 0.04, alpha: 1)
        cap.lineWidth   = 2
        cap.position    = capOnTop
            ? CGPoint(x: 0, y:  height / 2 - capH / 2)
            : CGPoint(x: 0, y: -height / 2 + capH / 2)
        node.addChild(cap)

        // Physics on the container node
        let pb = SKPhysicsBody(rectangleOf: CGSize(width: width, height: height))
        pb.isDynamic          = false
        pb.categoryBitMask    = catPipe
        pb.contactTestBitMask = catBird
        pb.collisionBitMask   = 0
        node.physicsBody = pb

        return node
    }

    private func cleanPipes() {
        enumerateChildNodes(withName: "pipe")   { $0.removeFromParent() }
        enumerateChildNodes(withName: "scorer") { $0.removeFromParent() }
    }

    // MARK: - Touch

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        switch state {
        case .idle:
            startGame()
        case .playing:
            flap()
        case .dead:
            // Reset bird and restart
            bird.removeAllActions()
            bird.physicsBody?.isDynamic = false
            bird.physicsBody?.velocity  = .zero
            bird.position   = CGPoint(x: size.width * 0.28, y: size.height * 0.55)
            bird.zRotation  = 0
            bird.fillColor  = SKColor(red: 1.00, green: 0.87, blue: 0.10, alpha: 1)
            startGame()
        }
    }

    // MARK: - Physics Contact

    func didBegin(_ contact: SKPhysicsContact) {
        let mask = contact.bodyA.categoryBitMask | contact.bodyB.categoryBitMask

        if mask == catBird | catScore {
            // Remove sensor immediately to avoid duplicate triggers
            if contact.bodyA.categoryBitMask == catScore {
                contact.bodyA.node?.removeFromParent()
            } else {
                contact.bodyB.node?.removeFromParent()
            }
            setScore(score + 1)
            let pop = SKAction.sequence([
                SKAction.scale(to: 1.40, duration: 0.06),
                SKAction.scale(to: 1.00, duration: 0.06)
            ])
            scoreLabel.run(pop)
        } else if mask & catBird != 0 && mask & (catPipe | catGround) != 0 {
            pendingDeath = true
        }
    }

    // MARK: - Update Loop

    override func update(_ currentTime: TimeInterval) {
        if pendingDeath {
            pendingDeath = false
            triggerDeath()
        }

        guard state == .playing else { return }

        // Tilt bird based on vertical velocity
        if let vy = bird.physicsBody?.velocity.dy {
            let target: CGFloat = vy > 0 ? 0.40 : max(-1.40, vy * 0.003)
            bird.zRotation = bird.zRotation * 0.82 + target * 0.18
        }
    }

    // MARK: - Helpers

    private func setScore(_ value: Int) {
        score = value
        let text = "\(value)"
        scoreLabel.text  = text
        scoreShadow.text = text
    }
}
