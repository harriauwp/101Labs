import numpy as np
import time
import matplotlib.pyplot as plt
import mpl_toolkits.mplot3d.axes3d as p3
from matplotlib import animation

# --- Constants ---
U = 1.66053906660e-27  # atomic mass unit
E_CHARGE = 1.602176634e-19  # Elementary charge
VAC_PERM = 8.8541878128e-12  # Vacuum permittivity
K_E = 1 / (4 * np.pi * VAC_PERM)  # Coulomb constant
K_BOLTZ = 1.380649e-23  # Boltzmann constant

# --- H2O Molecule Parameters ---
PARTIAL_CHARGE = 0.7 * E_CHARGE
CHARGE_H = 0.5 * PARTIAL_CHARGE
CHARGE_O = -PARTIAL_CHARGE
MASS_H = 1.00794 * U
MASS_O = 15.999 * U
BOND_ANGLE = 104.5 * np.pi / 180  # radians
BOND_LENGTH = 9.7e-11  # [m]
K_SPRING = 458.9  # bond strength

def z_rotation(vector, theta, num_molecules):
    """Rotates 3-D vector around z-axis"""
    R = np.array([[np.cos(theta), -np.sin(theta), 0],
                  [np.sin(theta), np.cos(theta), 0],
                  [0, 0, 1]])
    pos2 = vector.copy()
    for i in range(num_molecules):
        pos2[i] = np.dot(R, pos2[i, :])
    return pos2

def make_liquid(num_molecules, dims, bond_length, bond_angle, grid_dims, side_lengths):
    """Initializes the positions of the water molecules."""
    
    # Random spacing for Hydrogen atoms
    pos = np.random.normal(0, 1, size=(num_molecules, dims))
    r = np.linalg.norm(pos, axis=1)
    pos = pos / r.reshape(num_molecules, 1) * bond_length

    molecule = np.zeros((num_molecules, dims))

    # Initialize in a square grid
    xx = np.linspace(-side_lengths[0]/2, side_lengths[0]/2, grid_dims[0])
    yy = np.linspace(-side_lengths[1]/2, side_lengths[1]/2, grid_dims[1])
    zz = np.linspace(-side_lengths[2]/2, side_lengths[2]/2, grid_dims[2])
    mesh_x, mesh_y, mesh_z = np.meshgrid(xx, yy, zz)

    molecule[:, 0] = np.ravel(mesh_x)
    molecule[:, 1] = np.ravel(mesh_y)
    molecule[:, 2] = np.ravel(mesh_z)

    H1 = molecule + pos
    H2 = molecule + z_rotation(pos, bond_angle, num_molecules)
    O = molecule

    return H1, H2, O

def run_simulation(grid_dims, timesteps=1000, dt=5e-17):
    """Runs the physics simulation."""
    
    num_molecules = np.prod(grid_dims)
    dims = 3
    side_lengths = [2 * grid_dims[0] * BOND_LENGTH, 
                    2 * grid_dims[1] * BOND_LENGTH, 
                    2 * grid_dims[2] * BOND_LENGTH]

    # Initialize arrays
    pos_h1 = np.zeros((timesteps, num_molecules, dims))
    pos_h2 = np.zeros((timesteps, num_molecules, dims))
    pos_o = np.zeros((timesteps, num_molecules, dims))

    matrix_shape = pos_h1.shape
    vel_h1 = np.zeros(matrix_shape)
    vel_h2 = np.zeros(matrix_shape)
    vel_o = np.zeros(matrix_shape)
    
    acc_h1 = np.zeros(matrix_shape)
    acc_h2 = np.zeros(matrix_shape)
    acc_o = np.zeros(matrix_shape)

    # Set initial positions
    pos_h1[0], pos_h2[0], pos_o[0] = make_liquid(
        num_molecules, dims, BOND_LENGTH, BOND_ANGLE, grid_dims, side_lengths
    )

    print(f"Starting simulation for {num_molecules} molecules over {timesteps} steps...")
    start_time = time.time()

    for t in range(timesteps - 1):
        # 1. Spring Force (Intramolecular)
        for i in range(num_molecules):
            # H1-O bond
            diff1 = pos_o[t, i] - pos_h1[t, i]
            dist1 = np.linalg.norm(diff1)
            unit1 = diff1 / dist1
            force1 = K_SPRING * (dist1 - BOND_LENGTH)
            
            # H2-O bond
            diff2 = pos_o[t, i] - pos_h2[t, i]
            dist2 = np.linalg.norm(diff2)
            unit2 = diff2 / dist2
            force2 = K_SPRING * (dist2 - BOND_LENGTH)

            # Apply spring accelerations
            # Note: spring_acc arrays are local to loop, using pre-allocated `acc` arrays
            # to store total acceleration directly to save memory/lookup time in this script structure
            acc_h1[t, i] += unit1 * force1 / MASS_H
            acc_h2[t, i] += unit2 * force2 / MASS_H
            acc_o[t, i] += (-unit1 * force1 - unit2 * force2) / MASS_O

        # 2. Coulomb Force (Intermolecular)
        for i in range(num_molecules):
            mask = np.arange(num_molecules) != i
            
            # Helper to calc force
            def calc_coulomb(pos_a_i, pos_b_others, q_a, q_b):
                diff = pos_a_i - pos_b_others
                dist = np.linalg.norm(diff, axis=1)
                # Avoid division by zero if particles overlap (simple clamp)
                dist = np.maximum(dist, 1e-15) 
                unit = diff / dist.reshape(-1, 1)
                force = K_E * q_a * q_b * unit / (dist.reshape(-1, 1) ** 2)
                return np.sum(force, axis=0)

            # Forces on H1[i]
            f_h1 = (calc_coulomb(pos_h1[t, i], pos_h1[t, mask], CHARGE_H, CHARGE_H) +
                    calc_coulomb(pos_h1[t, i], pos_o[t, mask], CHARGE_H, CHARGE_O) +
                    calc_coulomb(pos_h1[t, i], pos_h2[t, mask], CHARGE_H, CHARGE_H))
            
            # Forces on H2[i]
            f_h2 = (calc_coulomb(pos_h2[t, i], pos_h2[t, mask], CHARGE_H, CHARGE_H) +
                    calc_coulomb(pos_h2[t, i], pos_o[t, mask], CHARGE_H, CHARGE_O) +
                    calc_coulomb(pos_h2[t, i], pos_h1[t, mask], CHARGE_H, CHARGE_H))
            
            # Forces on O[i]
            f_o = (calc_coulomb(pos_o[t, i], pos_h1[t, mask], CHARGE_O, CHARGE_H) +
                   calc_coulomb(pos_o[t, i], pos_h2[t, mask], CHARGE_O, CHARGE_H) +
                   calc_coulomb(pos_o[t, i], pos_o[t, mask], CHARGE_O, CHARGE_O))

            acc_h1[t, i] += f_h1 / MASS_H
            acc_h2[t, i] += f_h2 / MASS_H
            acc_o[t, i] += f_o / MASS_O

        # Euler-Cromer Integration
        vel_h1[t + 1] = vel_h1[t] + acc_h1[t] * dt
        vel_h2[t + 1] = vel_h2[t] + acc_h2[t] * dt
        vel_o[t + 1] = vel_o[t] + acc_o[t] * dt

        pos_h1[t + 1] = pos_h1[t] + vel_h1[t + 1] * dt
        pos_h2[t + 1] = pos_h2[t] + vel_h2[t + 1] * dt
        pos_o[t + 1] = pos_o[t] + vel_o[t + 1] * dt

        if t % 50 == 0:
            print(f"Step {t}/{timesteps}")

    print(f"Simulation completed in {time.time() - start_time:.2f} seconds.")
    return [pos_h1, pos_h2, pos_o]

def animate_scatters(iteration, data, scatters):
    """Updates the scatter plot for animation."""
    data1, data2, data3 = data
    scatters[0]._offsets3d = (data1[iteration, :, 0], data1[iteration, :, 1], data1[iteration, :, 2])
    scatters[1]._offsets3d = (data2[iteration, :, 0], data2[iteration, :, 1], data2[iteration, :, 2])
    scatters[2]._offsets3d = (data3[iteration, :, 0], data3[iteration, :, 1], data3[iteration, :, 2])
    return scatters

def create_animation(data, save_file="water_simulation.mp4"):
    """Creates and optionally saves the 3D animation."""
    fig = plt.figure()
    ax = p3.Axes3D(fig)

    # Initialize scatters
    # H1 atoms (Pinkish Red)
    s1 = ax.scatter(data[0][0, :, 0], data[0][0, :, 1], data[0][0, :, 2], c='xkcd:pinkish red', s=50, label='H1')
    # H2 atoms (Pinkish Red)
    s2 = ax.scatter(data[1][0, :, 0], data[1][0, :, 1], data[1][0, :, 2], c='xkcd:pinkish red', s=50, label='H2')
    # O atoms (Greenish Blue)
    s3 = ax.scatter(data[2][0, :, 0], data[2][0, :, 1], data[2][0, :, 2], c='xkcd:greenish blue', s=250, label='O')
    
    scatters = [s1, s2, s3]

    # Axis properties
    limit = 3e-10
    ax.set_xlim3d([-limit, limit])
    ax.set_ylim3d([-limit, limit])
    ax.set_zlim3d([-limit, limit])
    ax.set_xlabel('X')
    ax.set_ylabel('Y')
    ax.set_zlabel('Z')
    ax.legend()

    # Animation
    iterations = len(data[0])
    ani = animation.FuncAnimation(fig, animate_scatters, iterations, fargs=(data, scatters),
                                  interval=20, blit=False, repeat=True)

    if save_file:
        try:
            print(f"Saving animation to {save_file}...")
            # Requires ffmpeg installed on system
            Writer = animation.writers['ffmpeg']
            writer = Writer(fps=30, metadata=dict(artist='Sim'), bitrate=1800)
            ani.save(save_file, writer=writer)
            print("Save complete.")
        except Exception as e:
            print(f"Could not save video (ffmpeg might be missing): {e}")

    plt.show()

if __name__ == "__main__":
    # Settings
    GRID_DIMS = np.array([2, 2, 2])
    TIMESTEPS = 200 # Reduced for quicker testing, increase for full sim
    DT = 5e-17

    # Run Physics
    sim_data = run_simulation(GRID_DIMS, TIMESTEPS, DT)

    # Run Visualization
    create_animation(sim_data, save_file="water_sim.mp4")
